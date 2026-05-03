import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import MapView, { Marker, Polyline, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from '../../lib/supabase';

interface WaypointPin {
  lat: number;
  lng: number;
  name: string;
}

export default function RouteScreen() {
  const [waypoints, setWaypoints] = useState<WaypointPin[]>([]);
  const [region, setRegion] = useState({
    latitude: 59.3293,  // Stockholm default
    longitude: 18.0686,
    latitudeDelta: 1.5,
    longitudeDelta: 1.5,
  });
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setRegion(r => ({ ...r, latitude: loc.coords.latitude, longitude: loc.coords.longitude }));
    })();
  }, []);

  const handleMapPress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const order = waypoints.length + 1;
    setWaypoints(prev => [...prev, {
      lat: latitude,
      lng: longitude,
      name: order === 1 ? 'Start' : order === 2 ? 'Mål' : `Waypoint ${order - 1}`,
    }]);
  };

  const activateRoute = async () => {
    if (waypoints.length < 2) {
      Alert.alert('Lägg till minst 2 punkter', 'Tryck på kartan för att lägga till start och mål.');
      return;
    }
    setActivating(true);
    try {
      // Hämta och verifiera session – refresha om token håller på att gå ut
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr || !session) {
        Alert.alert('Inte inloggad', 'Logga in igen för att aktivera en rutt.');
        return;
      }

      const departureTime = new Date().toISOString();
      const speedKnots = 6;
      const speedMs = speedKnots * 0.514444;

      // Calculate ETAs
      const wpsWithEta = waypoints.map((wp, i) => {
        if (i === 0) return { ...wp, eta: departureTime };
        const prev = waypoints[i - 1];
        const distanceM = Math.sqrt(
          Math.pow((wp.lat - prev.lat) * 111320, 2) +
          Math.pow((wp.lng - prev.lng) * 111320 * Math.cos(prev.lat * Math.PI / 180), 2)
        );
        const travelSeconds = distanceM / speedMs;
        const prevEta = new Date(waypoints[i - 1] ? departureTime : departureTime);
        prevEta.setSeconds(prevEta.getSeconds() + travelSeconds * i);
        return { ...wp, eta: prevEta.toISOString() };
      });

      // Använd RPC-funktion för att kringgå PostgREST schema-cache-problem
      const { error: rpcErr } = await supabase.rpc('create_route', {
        p_user_id:     session.user.id,
        p_name:        `Rutt ${new Date().toLocaleDateString('sv-SE')}`,
        p_departure:   departureTime,
        p_speed_knots: speedKnots,
        p_geojson: {
          type: 'LineString',
          coordinates: waypoints.map(wp => [wp.lng, wp.lat]),
        },
        p_waypoints: wpsWithEta.map((wp, i) => ({
          sequence_order: i,
          lat:  wp.lat,
          lng:  wp.lng,
          name: wp.name,
          eta:  wp.eta,
        })),
      });

      if (rpcErr) throw rpcErr;

      Alert.alert('🚢 Rutt aktiverad!', 'Kapten AI håller nu koll på vädret längs din rutt.');
      setWaypoints([]);
    } catch (e: any) {
      Alert.alert('Fel', `${e?.message ?? 'Okänt fel'}\n\nKod: ${e?.code ?? '–'}\nDetaljer: ${e?.details ?? '–'}`);
    } finally {
      setActivating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗺️ Planera rutt</Text>
        <Text style={styles.subtitle}>Tryck på kartan för att lägga till waypoints</Text>
      </View>

      <MapView
        style={styles.map}
        region={region}
        onPress={handleMapPress}
        mapType="hybrid"
      >
        {waypoints.map((wp, i) => (
          <Marker key={i} coordinate={{ latitude: wp.lat, longitude: wp.lng }} title={wp.name}>
            <View style={[styles.pin, i === 0 ? styles.startPin : styles.waypointPin]}>
              <Text style={styles.pinText}>{i === 0 ? '⚓' : i === waypoints.length - 1 ? '🏁' : `${i}`}</Text>
            </View>
          </Marker>
        ))}
        {waypoints.length > 1 && (
          <Polyline
            coordinates={waypoints.map(wp => ({ latitude: wp.lat, longitude: wp.lng }))}
            strokeColor="#0A84FF"
            strokeWidth={3}
          />
        )}
      </MapView>

      <View style={styles.footer}>
        <Text style={styles.disclaimer}>⚠️ Ersätter inte sjökort eller navigationsutrustning</Text>
        <Text style={styles.count}>{waypoints.length} punkt{waypoints.length !== 1 ? 'er' : ''} lagd{waypoints.length !== 1 ? 'a' : ''}</Text>
        <View style={styles.buttons}>
          {waypoints.length > 0 && (
            <TouchableOpacity onPress={() => setWaypoints([])} style={styles.clearButton}>
              <Text style={styles.clearText}>Rensa</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={activateRoute}
            style={[styles.activateButton, waypoints.length < 2 && styles.disabled]}
            disabled={waypoints.length < 2 || activating}
          >
            <Text style={styles.activateText}>{activating ? 'Aktiverar...' : '🚢 Aktivera rutt'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { padding: 16, paddingBottom: 8 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#636366', fontSize: 13, marginTop: 2 },
  map: { flex: 1 },
  pin: { padding: 6, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  startPin: { backgroundColor: '#34C759' },
  waypointPin: { backgroundColor: '#0A84FF' },
  pinText: { fontSize: 16 },
  footer: { backgroundColor: '#1C1C1E', padding: 16, paddingBottom: 8 },
  disclaimer: { color: '#FF9500', fontSize: 11, marginBottom: 6, textAlign: 'center' },
  count: { color: '#636366', fontSize: 13, marginBottom: 8 },
  buttons: { flexDirection: 'row', gap: 10 },
  clearButton: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#2C2C2E', alignItems: 'center' },
  clearText: { color: '#FF3B30', fontWeight: '600' },
  activateButton: { flex: 2, padding: 14, borderRadius: 12, backgroundColor: '#0A84FF', alignItems: 'center' },
  disabled: { opacity: 0.4 },
  activateText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
