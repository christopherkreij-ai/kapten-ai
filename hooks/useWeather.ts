import { useState, useEffect, useCallback } from 'react';
import { WeatherData } from '../lib/types';

const SMHI_BASE = 'https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point';

export interface ForecastSlot {
  time:    Date;
  weather: WeatherData;
}

export function useWeather(lat: number | null, lon: number | null) {
  const [forecasts, setForecasts]           = useState<ForecastSlot[]>([]);
  const [selectedIndex, setSelectedIndex]   = useState(0);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    if (!lat || !lon) return;
    setLoading(true);
    setError(null);

    try {
      const tryFetch = async (precision: number) => {
        const url = `${SMHI_BASE}/lon/${lon.toFixed(precision)}/lat/${lat.toFixed(precision)}/data.json`;
        try { return await fetch(url); } catch (e: any) { throw new Error(`Nätverksfel: ${e.message}`); }
      };

      let res = await tryFetch(4);
      if (res.status === 404) res = await tryFetch(2);
      if (res.status === 404) res = await tryFetch(1);
      if (!res.ok) throw new Error(`SMHI svarade med HTTP ${res.status}`);

      const data = await res.json();
      const timeSeries: any[] = data.timeSeries ?? [];
      const now = Date.now();
      const cutoff = now + 24 * 60 * 60 * 1000; // 24h framåt

      // Filtrera ut de närmaste 24 timmarna
      const slots: ForecastSlot[] = timeSeries
        .filter(ts => {
          const t = new Date(ts.time).getTime();
          return t >= now - 30 * 60 * 1000 && t <= cutoff; // inkludera 30 min bak för "nu"
        })
        .map(ts => {
          const d = ts.data ?? {};
          const visRaw: number = d.visibility_in_air ?? 0;
          const visKm = visRaw >= 9999 ? 50 : visRaw > 100 ? visRaw / 1000 : visRaw;
          return {
            time: new Date(ts.time),
            weather: {
              wind_speed_ms:      d.wind_speed           ?? 0,
              wind_gust_ms:       d.wind_speed_of_gust   ?? 0,
              wind_direction_deg: d.wind_from_direction  ?? 0,
              wave_height_m:      0,
              visibility_km:      visKm,
              thunder_risk:       (d.thunderstorm_probability ?? 0) > 20,
              temperature_c:      d.air_temperature      ?? 0,
              fetched_at:         new Date().toISOString(),
            },
          };
        });

      setForecasts(slots);
      setSelectedIndex(0); // börja med närmaste tid
    } catch (e: any) {
      setError(e.message ?? 'Okänt fel');
    } finally {
      setLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  const weather = forecasts[selectedIndex]?.weather ?? null;

  return { weather, forecasts, selectedIndex, setSelectedIndex, loading, error, refresh: fetchWeather };
}
