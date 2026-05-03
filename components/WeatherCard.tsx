import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WeatherData } from '../lib/types';
import { getBeaufort, windDirectionLabel } from '../constants/thresholds';

interface Props {
  weather: WeatherData;
  locationName?: string;
}

export function WeatherCard({ weather, locationName }: Props) {
  const beaufort = getBeaufort(weather.wind_speed_ms);
  const dirLabel = windDirectionLabel(weather.wind_direction_deg);
  const isWarning = weather.wind_speed_ms >= 10 || weather.wave_height_m >= 1.5;
  const isDanger = weather.thunder_risk || weather.wind_gust_ms >= 18;

  const cardColor = isDanger ? '#FF3B30' : isWarning ? '#FF9500' : '#34C759';

  return (
    <View style={[styles.card, { borderLeftColor: cardColor }]}>
      {locationName && <Text style={styles.location}>{locationName}</Text>}

      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.value}>{weather.wind_speed_ms.toFixed(1)}</Text>
          <Text style={styles.unit}>m/s</Text>
          <Text style={styles.label}>Vind</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.value}>{weather.wind_gust_ms.toFixed(1)}</Text>
          <Text style={styles.unit}>m/s</Text>
          <Text style={styles.label}>Byar</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.value}>{weather.wave_height_m.toFixed(1)}</Text>
          <Text style={styles.unit}>m</Text>
          <Text style={styles.label}>Vågor</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.value}>{dirLabel}</Text>
          <Text style={styles.unit}>{weather.wind_direction_deg}°</Text>
          <Text style={styles.label}>Riktning</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.beaufort}>Bft {beaufort.force} — {beaufort.label}</Text>
        {weather.thunder_risk && <Text style={styles.thunder}>⚡ Åskrisk</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  location: { color: '#EBEBF5', fontSize: 13, marginBottom: 12, opacity: 0.6 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { alignItems: 'center' },
  value: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
  unit: { color: '#EBEBF5', fontSize: 11, opacity: 0.5 },
  label: { color: '#EBEBF5', fontSize: 12, marginTop: 2, opacity: 0.7 },
  footer: { flexDirection: 'row', marginTop: 12, justifyContent: 'space-between' },
  beaufort: { color: '#EBEBF5', fontSize: 12, opacity: 0.6 },
  thunder: { color: '#FFD60A', fontSize: 12, fontWeight: '600' },
});
