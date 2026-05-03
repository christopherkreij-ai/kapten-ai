import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const DISCLAIMER_KEY = 'kapten_disclaimer_accepted_v1';

export function DisclaimerModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(DISCLAIMER_KEY).then(val => {
      if (!val) setVisible(true);
    });
  }, []);

  const accept = async () => {
    await AsyncStorage.setItem(DISCLAIMER_KEY, 'true');
    setVisible(false);
    // Be om platstillstånd direkt efter godkännande
    await Location.requestForegroundPermissionsAsync();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <Text style={styles.icon}>⚓</Text>
        <Text style={styles.title}>Viktig information</Text>
        <Text style={styles.subtitle}>Läs igenom innan du använder Kapten.ai</Text>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🗺️ Ersätter inte sjökort</Text>
            <Text style={styles.body}>
              Kapten.ai är ett kompletterande hjälpmedel och ersätter <Text style={styles.bold}>inte</Text> officiella sjökort,
              godkänd navigationsutrustning eller gällande sjöfartsregler. Använd alltid uppdaterade sjökort
              från Sjöfartsverket vid navigering.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧭 Ersätter inte navigationsutrustning</Text>
            <Text style={styles.body}>
              Appen är inte certifierad som navigationsinstrument. GPS-funktionalitet i mobilen är
              inte tillförlitlig nog för säker navigering i alla förhållanden. Ha alltid kompass,
              sjökort och annan navigationsutrustning ombord.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌊 Väderprognoser är prognoser</Text>
            <Text style={styles.body}>
              Väderdata hämtas från SMHI och kan avvika från verkliga förhållanden. Kontrollera
              alltid officiella varningar och prognoser innan avfärd. Havet kan förändras snabbt —
              lita aldrig blint på en app.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🆘 Vid nödsituation</Text>
            <Text style={styles.body}>
              Larma alltid via <Text style={styles.bold}>VHF kanal 16</Text> eller ring{' '}
              <Text style={styles.bold}>114 14</Text> (JRCC Sverige, dygnet runt).{'\n'}
              Sjöräddningssällskapet (SSRS): <Text style={styles.bold}>0771-990 100</Text>
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Användarens ansvar</Text>
            <Text style={styles.body}>
              Du som förare bär alltid det fulla ansvaret för båt, besättning och säkerhet.
              Kapten.ai och dess utvecklare tar inget ansvar för beslut fattade baserat på
              information i appen.
            </Text>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.button} onPress={accept}>
          <Text style={styles.buttonText}>Jag förstår och accepterar</Text>
        </TouchableOpacity>
        <Text style={styles.footer}>Du kan alltid läsa detta igen under Guider</Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', padding: 24, paddingTop: 48 },
  icon: { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: '#636366', fontSize: 14, textAlign: 'center', marginBottom: 24 },
  scroll: { flex: 1 },
  section: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, marginBottom: 12 },
  sectionTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginBottom: 8 },
  body: { color: '#EBEBF5', fontSize: 14, lineHeight: 22, opacity: 0.8 },
  bold: { fontWeight: '700', color: '#FFFFFF', opacity: 1 },
  button: { backgroundColor: '#0A84FF', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  footer: { color: '#636366', fontSize: 12, textAlign: 'center', marginTop: 10 },
});
