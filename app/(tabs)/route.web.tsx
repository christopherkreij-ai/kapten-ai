import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function RouteScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.icon}>🗺️</Text>
        <Text style={styles.title}>Kartfunktionen</Text>
        <Text style={styles.subtitle}>Öppna appen i Expo Go på din telefon för att planera rutter med kartan.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#636366', fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
