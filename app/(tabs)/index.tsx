import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, RefreshControl, StyleSheet, SafeAreaView,
  TouchableOpacity, Linking, TextInput, ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';
import { useWeather } from '../../hooks/useWeather';
import { WeatherCard } from '../../components/WeatherCard';
import { AlertBanner } from '../../components/AlertBanner';
import { useActiveRoute } from '../../hooks/useActiveRoute';
import { useFavorites } from '../../hooks/useFavorites';
import { supabase } from '../../lib/supabase';

type LocationStatus = 'loading' | 'granted' | 'denied' | 'unavailable';

function windColor(ms: number) {
  if (ms >= 14) return '#FF3B30';
  if (ms >= 8)  return '#FF9500';
  return '#34C759';
}

function formatTime(d: Date) {
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export default function WeatherScreen() {
  const [userId, setUserId]                 = useState<string | null>(null);
  const [location, setLocation]             = useState<{ lat: number; lon: number } | null>(null);
  const [locationName, setLocationName]     = useState('Din position');
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('loading');

  const [searchText, setSearchText]   = useState('');
  const [searching, setSearching]     = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchRef                     = useRef<TextInput>(null);

  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
  const currentlyFavorited = location ? isFavorite(location.lat, location.lon) : false;

  const toggleFavorite = () => {
    if (!location) return;
    if (currentlyFavorited) {
      const fav = favorites.find(f => Math.abs(f.lat - location.lat) < 0.01);
      if (fav) removeFavorite(fav.id);
    } else {
      addFavorite(locationName, location.lat, location.lon);
    }
  };

  const loadFavorite = (lat: number, lon: number, name: string) => {
    setLocation({ lat, lon });
    setLocationName(name);
    setLocationStatus('granted');
    setSearchText('');
  };

  const {
    weather, forecasts, selectedIndex, setSelectedIndex,
    loading, error: weatherError, refresh,
  } = useWeather(location?.lat ?? null, location?.lon ?? null);

  const { alerts, acknowledgeAlert } = useActiveRoute(userId);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user.id ?? null);
    });
    getGpsLocation();
  }, []);

  const getGpsLocation = async () => {
    setLocationStatus('loading');
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'denied') { setLocationStatus('denied'); return; }
      if (status !== 'granted') {
        const { status: s2 } = await Location.requestForegroundPermissionsAsync();
        if (s2 !== 'granted') { setLocationStatus('denied'); return; }
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });
      setLocationStatus('granted');
      const [place] = await Location.reverseGeocodeAsync(loc.coords);
      if (place) {
        const district = place.district ?? place.subregion;
        const city     = place.city ?? place.region;
        setLocationName(district && city ? `${district}, ${city}` : city ?? district ?? 'Din position');
      }
    } catch { setLocationStatus('unavailable'); }
  };

  const searchLocation = async () => {
    const query = searchText.trim();
    if (!query) return;
    setSearching(true);
    setSearchError(null);
    searchRef.current?.blur();
    try {
      const results = await Location.geocodeAsync(query + ', Sverige');
      if (!results.length) { setSearchError('Hittade ingen plats – försök med stad eller ort'); return; }
      const { latitude, longitude } = results[0];
      setLocation({ lat: latitude, lon: longitude });
      setLocationStatus('granted');
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (place) {
        const district = place.district ?? place.subregion;
        const city     = place.city ?? place.region;
        setLocationName(district && city ? `${district}, ${city}` : city ?? district ?? query);
      } else { setLocationName(query); }
    } catch { setSearchError('Sökning misslyckades, försök igen'); }
    finally { setSearching(false); }
  };

  const useMyLocation = () => { setSearchText(''); setSearchError(null); getGpsLocation(); };

  // De 5 närmaste timmarna (exkl. vald tid)
  const next5 = forecasts.slice(0, 5);
  const selectedForecast = forecasts[selectedIndex];
  const isLive = selectedIndex === 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#0A84FF" />}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>⚓ Kapten.ai</Text>
            {locationStatus === 'granted' && location && (
              <TouchableOpacity onPress={toggleFavorite} style={styles.starBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.starIcon}>{currentlyFavorited ? '⭐' : '☆'}</Text>
              </TouchableOpacity>
            )}
          </View>
          {locationStatus === 'granted' && (
            <Text style={styles.subtitle}>📍 {locationName}</Text>
          )}
        </View>

        {/* Sökruta */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              ref={searchRef}
              style={styles.searchInput}
              placeholder="Sök plats i Sverige..."
              placeholderTextColor="#555"
              value={searchText}
              onChangeText={t => { setSearchText(t); setSearchError(null); }}
              onSubmitEditing={searchLocation}
              returnKeyType="search"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>
          {searchText.length > 0 ? (
            <TouchableOpacity style={styles.searchBtn} onPress={searchLocation} disabled={searching}>
              {searching ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.searchBtnText}>Sök</Text>}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.gpsBtn} onPress={useMyLocation}>
              <Text style={styles.gpsBtnText}>📡</Text>
            </TouchableOpacity>
          )}
        </View>
        {searchError && <Text style={styles.searchErr}>{searchError}</Text>}

        {/* Favoriter */}
        {favorites.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.favRow}
            style={styles.favScroll}
          >
            {favorites.map(fav => {
              const isActive = location
                ? Math.abs(fav.lat - location.lat) < 0.01 && Math.abs(fav.lon - location.lon) < 0.01
                : false;
              return (
                <TouchableOpacity
                  key={fav.id}
                  style={[styles.favChip, isActive && styles.favChipActive]}
                  onPress={() => loadFavorite(fav.lat, fav.lon, fav.name)}
                  onLongPress={() => removeFavorite(fav.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.favChipStar}>⭐</Text>
                  <Text style={[styles.favChipText, isActive && styles.favChipTextActive]} numberOfLines={1}>
                    {fav.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* AI-varningar */}
        {alerts.map(alert => (
          <AlertBanner key={alert.id} alert={alert} onAcknowledge={acknowledgeAlert} />
        ))}

        {/* Platstillstånd nekad */}
        {locationStatus === 'denied' && !location && (
          <View style={styles.permissionCard}>
            <Text style={styles.permissionIcon}>📍</Text>
            <Text style={styles.permissionTitle}>Platstjänster behövs</Text>
            <Text style={styles.permissionBody}>
              Kapten.ai behöver din position för att hämta väderdata. Du kan också söka manuellt ovan.
            </Text>
            <TouchableOpacity style={styles.permissionBtn} onPress={() => Linking.openSettings()}>
              <Text style={styles.permissionBtnText}>Öppna Inställningar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Laddar position */}
        {locationStatus === 'loading' && (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderEmoji}>🛰️</Text>
            <Text style={styles.placeholderText}>Hämtar din position...</Text>
          </View>
        )}

        {/* Väderfel */}
        {locationStatus === 'granted' && !weather && weatherError && (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderEmoji}>⚠️</Text>
            <Text style={styles.placeholderText}>Kunde inte hämta väder</Text>
            <Text style={styles.placeholderSubtext}>{weatherError}</Text>
            <TouchableOpacity onPress={refresh} style={styles.retryBtn}>
              <Text style={styles.retryText}>Försök igen</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Laddar väder */}
        {locationStatus === 'granted' && !weather && !weatherError && (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderEmoji}>🌊</Text>
            <Text style={styles.placeholderText}>Hämtar väderdata från SMHI...</Text>
          </View>
        )}

        {/* ── Prognos-sektion ── */}
        {forecasts.length > 0 && (
          <View style={styles.forecastSection}>

            {/* 5 kommande timmar */}
            <View style={styles.hoursRow}>
              {next5.map((slot, i) => {
                const isSelected = i === selectedIndex;
                const w = slot.weather.wind_speed_ms;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.hourBox, isSelected && styles.hourBoxSelected]}
                    onPress={() => setSelectedIndex(i)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.hourLabel, isSelected && styles.hourLabelSelected]}>
                      {i === 0 ? 'Nu' : formatTime(slot.time)}
                    </Text>
                    <Text style={[styles.hourWind, { color: windColor(w) }]}>
                      {w.toFixed(1)}
                    </Text>
                    <Text style={styles.hourWindUnit}>m/s</Text>
                    <Text style={styles.hourTemp}>{slot.weather.temperature_c.toFixed(0)}°</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Slider – 0 till 23 h */}
            <View style={styles.sliderWrapper}>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelLeft}>
                  {isLive ? '🟢 Nu' : `🕐 ${formatTime(selectedForecast.time)}`}
                </Text>
                <Text style={styles.sliderLabelRight}>
                  {forecasts.length > 0 ? `+24h  ${formatTime(forecasts[forecasts.length - 1].time)}` : ''}
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={Math.max(forecasts.length - 1, 1)}
                step={1}
                value={selectedIndex}
                onValueChange={(v: number) => setSelectedIndex(Math.round(v))}
                minimumTrackTintColor="#0A84FF"
                maximumTrackTintColor="#2C2C2E"
                thumbTintColor="#0A84FF"
              />
            </View>
          </View>
        )}

        {/* Väderkortet – uppdateras med vald tid */}
        {weather && (
          <WeatherCard
            weather={weather}
            locationName={isLive ? locationName : `${locationName}  ·  ${formatTime(selectedForecast.time)}`}
          />
        )}

        {/* SOS */}
        <View style={styles.safetyCard}>
          <Text style={styles.safetyTitle}>🆘 Vid nödsituation</Text>
          <Text style={styles.safetyText}>JRCC Sverige: <Text style={styles.phone}>114 14</Text></Text>
          <Text style={styles.safetyText}>Sjöräddningssällskapet: <Text style={styles.phone}>0771-990 100</Text></Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#000000' },
  header:     { padding: 24, paddingBottom: 8 },
  headerRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title:      { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  subtitle:   { color: '#636366', fontSize: 14, marginTop: 4 },
  starBtn:    { padding: 4 },
  starIcon:   { fontSize: 24 },

  favScroll:          { marginBottom: 8 },
  favRow:             { paddingHorizontal: 16, gap: 8 },
  favChip:            { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', borderRadius: 20, paddingVertical: 7, paddingHorizontal: 12, borderWidth: 1.5, borderColor: 'transparent', gap: 5 },
  favChipActive:      { borderColor: '#FFD60A', backgroundColor: '#1C1A00' },
  favChipStar:        { fontSize: 12 },
  favChipText:        { color: '#EBEBF5', fontSize: 13, fontWeight: '500', maxWidth: 120 },
  favChipTextActive:  { color: '#FFD60A', fontWeight: '700' },

  searchRow:      { flexDirection: 'row', marginHorizontal: 16, marginBottom: 4, gap: 8 },
  searchBox:      { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', borderRadius: 12, paddingHorizontal: 12 },
  searchIcon:     { fontSize: 16, marginRight: 6 },
  searchInput:    { flex: 1, color: '#FFFFFF', fontSize: 15, paddingVertical: 12 },
  searchBtn:      { backgroundColor: '#0A84FF', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center', minWidth: 60, alignItems: 'center' },
  searchBtnText:  { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  gpsBtn:         { backgroundColor: '#1C1C1E', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
  gpsBtnText:     { fontSize: 18 },
  searchErr:      { color: '#FF9500', fontSize: 13, marginHorizontal: 20, marginBottom: 8 },

  placeholder:        { margin: 16, padding: 36, backgroundColor: '#1C1C1E', borderRadius: 12, alignItems: 'center' },
  placeholderEmoji:   { fontSize: 32, marginBottom: 10 },
  placeholderText:    { color: '#636366', fontSize: 15 },
  placeholderSubtext: { color: '#636366', fontSize: 12, marginTop: 4, textAlign: 'center' },
  retryBtn:           { marginTop: 14, backgroundColor: '#0A84FF', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryText:          { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  permissionCard:     { margin: 16, padding: 24, backgroundColor: '#1C1C1E', borderRadius: 12, alignItems: 'center' },
  permissionIcon:     { fontSize: 36, marginBottom: 10 },
  permissionTitle:    { color: '#FFFFFF', fontSize: 17, fontWeight: '700', marginBottom: 8 },
  permissionBody:     { color: '#EBEBF5', fontSize: 14, textAlign: 'center', opacity: 0.7, lineHeight: 20, marginBottom: 16 },
  permissionBtn:      { backgroundColor: '#0A84FF', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  permissionBtnText:  { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

  // Prognos
  forecastSection:    { marginHorizontal: 16, marginTop: 8, backgroundColor: '#1C1C1E', borderRadius: 16, padding: 14 },

  // 5 timmar-boxar
  hoursRow:           { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  hourBox:            { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, marginHorizontal: 2, borderWidth: 1.5, borderColor: 'transparent' },
  hourBoxSelected:    { borderColor: '#0A84FF', backgroundColor: '#0A1A2E' },
  hourLabel:          { color: '#636366', fontSize: 11, fontWeight: '700', marginBottom: 4 },
  hourLabelSelected:  { color: '#0A84FF' },
  hourWind:           { fontSize: 14, fontWeight: '800' },
  hourWindUnit:       { color: '#636366', fontSize: 9, marginBottom: 2 },
  hourTemp:           { color: '#EBEBF5', fontSize: 12 },

  // Slider
  sliderWrapper:      { paddingHorizontal: 4 },
  sliderLabels:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  sliderLabelLeft:    { color: '#0A84FF', fontSize: 12, fontWeight: '600' },
  sliderLabelRight:   { color: '#636366', fontSize: 12 },
  slider:             { width: '100%', height: 40 },

  safetyCard:   { margin: 16, marginTop: 8, padding: 16, backgroundColor: '#1C1C1E', borderRadius: 12 },
  safetyTitle:  { color: '#FF3B30', fontSize: 15, fontWeight: '700', marginBottom: 8 },
  safetyText:   { color: '#EBEBF5', fontSize: 14, marginBottom: 4 },
  phone:        { color: '#0A84FF', fontWeight: '700' },
});
