import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'kapten_favorites_v1';

export interface FavoriteLocation {
  id:   string;
  name: string;
  lat:  number;
  lon:  number;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) setFavorites(JSON.parse(raw));
    });
  }, []);

  const save = useCallback(async (list: FavoriteLocation[]) => {
    setFavorites(list);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }, []);

  const addFavorite = useCallback(async (name: string, lat: number, lon: number) => {
    setFavorites(prev => {
      // Undvik dubletter (samma koordinat ±0.01 grad)
      const exists = prev.some(f => Math.abs(f.lat - lat) < 0.01 && Math.abs(f.lon - lon) < 0.01);
      if (exists) return prev;
      const next = [...prev, { id: `${lat.toFixed(4)}_${lon.toFixed(4)}`, name, lat, lon }];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFavorite = useCallback(async (id: string) => {
    setFavorites(prev => {
      const next = prev.filter(f => f.id !== id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback((lat: number, lon: number) =>
    favorites.some(f => Math.abs(f.lat - lat) < 0.01 && Math.abs(f.lon - lon) < 0.01),
  [favorites]);

  return { favorites, addFavorite, removeFavorite, isFavorite };
}
