import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RouteAlert } from '../lib/types';

interface Props {
  alert: RouteAlert;
  onAcknowledge: (id: string) => void;
}

export function AlertBanner({ alert, onAcknowledge }: Props) {
  const bgColor = alert.severity === 'danger' ? '#FF3B30' : alert.severity === 'warning' ? '#FF9500' : '#0A84FF';
  const icon = alert.severity === 'danger' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️';

  return (
    <View style={[styles.banner, { backgroundColor: bgColor }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.text}>
          <Text style={styles.message}>{alert.message_sv}</Text>
          {alert.suggested_action_sv && (
            <Text style={styles.action}>{alert.suggested_action_sv}</Text>
          )}
        </View>
      </View>
      <TouchableOpacity onPress={() => onAcknowledge(alert.id)} style={styles.ackButton}>
        <Text style={styles.ackText}>OK</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: { flexDirection: 'row', flex: 1, alignItems: 'flex-start' },
  icon: { fontSize: 20, marginRight: 10 },
  text: { flex: 1 },
  message: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', lineHeight: 20 },
  action: { color: '#FFFFFF', fontSize: 13, marginTop: 4, opacity: 0.85 },
  ackButton: { marginLeft: 12, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  ackText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});
