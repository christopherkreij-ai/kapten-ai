import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Route, RouteAlert } from '../../lib/types';
import { AlertBanner } from '../../components/AlertBanner';

export default function ActiveRouteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [route, setRoute] = useState<Route | null>(null);
  const [alerts, setAlerts] = useState<RouteAlert[]>([]);

  useEffect(() => {
    if (!id) return;

    supabase.from('routes').select('*, waypoints(*)').eq('id', id).single()
      .then(({ data }) => setRoute(data));

    supabase.from('route_alerts').select('*').eq('route_id', id)
      .eq('acknowledged', false).order('created_at', { ascending: false })
      .then(({ data }) => setAlerts(data ?? []));

    const sub = supabase.channel(`route-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'route_alerts', filter: `route_id=eq.${id}` },
        (payload) => setAlerts(prev => [payload.new as RouteAlert, ...prev]))
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [id]);

  const acknowledge = async (alertId: string) => {
    await supabase.from('route_alerts').update({ acknowledged: true, acknowledged_at: new Date().toISOString() }).eq('id', alertId);
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const cancelRoute = () => {
    Alert.alert('Avbryt rutt', 'Är du säker?', [
      { text: 'Nej', style: 'cancel' },
      { text: 'Ja, avbryt', style: 'destructive', onPress: async () => {
        await supabase.from('routes').update({ status: 'cancelled' }).eq('id', id);
        router.back();
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Tillbaka</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{route?.name ?? 'Aktiv rutt'}</Text>
        <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>● AKTIV</Text></View>
      </View>

      <ScrollView>
        {alerts.length === 0 ? (
          <View style={styles.allClear}>
            <Text style={styles.allClearIcon}>✅</Text>
            <Text style={styles.allClearText}>Inga varningar längs rutten</Text>
            <Text style={styles.allClearSub}>Kapten AI bevakar vädret var 30:e minut</Text>
          </View>
        ) : (
          alerts.map(alert => <AlertBanner key={alert.id} alert={alert} onAcknowledge={acknowledge} />)
        )}

        {route?.waypoints && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Waypoints</Text>
            {(route.waypoints as any[]).sort((a, b) => a.sequence_order - b.sequence_order).map((wp: any) => (
              <View key={wp.id} style={styles.waypointRow}>
                <Text style={styles.wpName}>{wp.name ?? `Waypoint ${wp.sequence_order + 1}`}</Text>
                {wp.eta && <Text style={styles.wpEta}>ETA {new Date(wp.eta).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}</Text>}
                {wp.wind_speed_ms && <Text style={styles.wpWeather}>{wp.wind_speed_ms.toFixed(1)} m/s</Text>}
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.cancelButton} onPress={cancelRoute}>
          <Text style={styles.cancelText}>Avbryt rutt</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  back: { color: '#0A84FF', fontSize: 15, marginBottom: 8 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  activeBadge: { backgroundColor: '#34C75922', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 6 },
  activeBadgeText: { color: '#34C759', fontSize: 12, fontWeight: '700' },
  allClear: { alignItems: 'center', paddingVertical: 48 },
  allClearIcon: { fontSize: 48, marginBottom: 12 },
  allClearText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  allClearSub: { color: '#636366', fontSize: 13, marginTop: 4 },
  section: { margin: 16 },
  sectionTitle: { color: '#EBEBF5', fontSize: 15, fontWeight: '700', marginBottom: 10, opacity: 0.6 },
  waypointRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1C1C1E', borderRadius: 10, padding: 12, marginBottom: 6 },
  wpName: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', flex: 1 },
  wpEta: { color: '#636366', fontSize: 13 },
  wpWeather: { color: '#0A84FF', fontSize: 13, marginLeft: 8 },
  cancelButton: { margin: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FF3B30', alignItems: 'center' },
  cancelText: { color: '#FF3B30', fontWeight: '600', fontSize: 15 },
});
