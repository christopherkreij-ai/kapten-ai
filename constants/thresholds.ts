import { AlertThreshold, ExperienceLevel } from '../lib/types';

// Default thresholds per experience level
export const DEFAULT_THRESHOLDS: Record<ExperienceLevel, Omit<AlertThreshold, 'id' | 'user_id' | 'name'>> = {
  beginner: {
    wind_speed_ms: 8,
    wind_gust_ms: 12,
    wave_height_m: 1.0,
    visibility_km: 3,
    thunder: true,
    wind_shift_degrees: 30,
  },
  intermediate: {
    wind_speed_ms: 10,
    wind_gust_ms: 15,
    wave_height_m: 1.5,
    visibility_km: 2,
    thunder: true,
    wind_shift_degrees: 45,
  },
  experienced: {
    wind_speed_ms: 14,
    wind_gust_ms: 20,
    wave_height_m: 2.5,
    visibility_km: 1,
    thunder: true,
    wind_shift_degrees: 60,
  },
};

export const BEAUFORT_SCALE = [
  { force: 0, label: 'Stiltje', ms: 0 },
  { force: 1, label: 'Nästan stiltje', ms: 0.5 },
  { force: 2, label: 'Svag vind', ms: 1.6 },
  { force: 3, label: 'Lätt bris', ms: 3.4 },
  { force: 4, label: 'God bris', ms: 5.5 },
  { force: 5, label: 'Frisk bris', ms: 8.0 },
  { force: 6, label: 'Stormig bris', ms: 10.8 },
  { force: 7, label: 'Hård vind', ms: 13.9 },
  { force: 8, label: 'Frisk kuling', ms: 17.2 },
  { force: 9, label: 'Stark kuling', ms: 20.8 },
  { force: 10, label: 'Hård kuling', ms: 24.5 },
];

export function getBeaufort(ms: number) {
  return [...BEAUFORT_SCALE].reverse().find(b => ms >= b.ms) ?? BEAUFORT_SCALE[0];
}

export function windDirectionLabel(deg: number): string {
  const dirs = ['N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO', 'S', 'SSV', 'SV', 'VSV', 'V', 'VNV', 'NV', 'NNV'];
  return dirs[Math.round(deg / 22.5) % 16];
}
