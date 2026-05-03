import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Linking } from 'react-native';

const APP_FEATURES = [
  {
    icon: '🌤️',
    title: 'Väder & 24h-prognos',
    desc: 'Hämtar realtidsdata från SMHI. Se vind, byar, sikt och temperatur just nu eller scrubba dygnet med slidern för att se hur vädret förändras timme för timme.',
    tag: 'Funktion',
  },
  {
    icon: '🔍',
    title: 'Sök valfri plats',
    desc: 'Skriv in valfri ort i Sverige i sökfältet för att direkt ladda vädret där. Tryck på 📡-knappen för att gå tillbaka till din GPS-position.',
    tag: 'Funktion',
  },
  {
    icon: '⭐',
    title: 'Favoritplatser',
    desc: 'Tryck på stjärnan (☆) i headern för att spara en plats som favorit. Favoriter syns alltid som chips under sökrutan — tryck för att ladda väder, håll inne för att ta bort.',
    tag: 'Funktion',
  },
  {
    icon: '🗺️',
    title: 'Ruttplanering',
    desc: 'Tryck på kartan för att lägga till waypoints. Appen ritar ut rutten och beräknar ETA för varje punkt. Tryck "Aktivera rutt" för att sätta AI-agenten i vakttjänst.',
    tag: 'Funktion',
  },
  {
    icon: '🤖',
    title: 'AI-ruttbevakning',
    desc: 'Med en aktiv rutt analyserar Claude AI vädret längs hela rutten var 30:e minut. Får varning om vind, byar, åska eller dålig sikt överstiger dina tröskelvärden.',
    tag: 'Funktion',
  },
];

const GUIDES = [
  { icon: '🌊', title: 'Förstå väderprognoser', desc: 'Vad betyder vindstyrka, byar och våghöjd för dig som båtförare?', tag: 'Nybörjare' },
  { icon: '⚓', title: 'Låna båt via Skippo?', desc: 'Viktiga tips innan du tar ut en hyrbåt — vad du behöver veta.', tag: 'Skippo' },
  { icon: '🗺️', title: 'Planera en säker rutt', desc: 'Hur du tänker kring ruttplanering, alternativa hamnar och vändpunkter.', tag: 'Nybörjare' },
  { icon: '⛅', title: 'Vad är Beaufortskalan?', desc: 'Lär dig de 12 graderna och vad de innebär på vattnet.', tag: 'Väder' },
  { icon: '🆘', title: 'Sjöräddning & nödanrop', desc: 'Hur du larmar, VHF kanal 16, och vad som händer när du ringer 114 14.', tag: 'Säkerhet' },
  { icon: '🌡️', title: 'Inför båtsäsongen', desc: 'Checklista för sjösättning, motorservice och säkerhetsutrustning.', tag: 'Säsong' },
];

const TAG_COLORS: Record<string, string> = {
  'Nybörjare': '#30D158',
  'Skippo':    '#0A84FF',
  'Väder':     '#FF9F0A',
  'Säkerhet':  '#FF3B30',
  'Säsong':    '#BF5AF2',
  'Funktion':  '#636366',
};

export default function GuideScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>📖 Guider</Text>
          <Text style={styles.subtitle}>Nyttig information för alla nivåer</Text>
        </View>

        {/* App-funktioner */}
        <Text style={styles.sectionHeader}>📱 Så här fungerar appen</Text>
        {APP_FEATURES.map((f, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.icon}>{f.icon}</Text>
              <View style={styles.cardText}>
                <View style={styles.titleRow}>
                  <Text style={styles.cardTitle}>{f.title}</Text>
                  <View style={[styles.tag, { backgroundColor: TAG_COLORS[f.tag] }]}>
                    <Text style={styles.tagText}>{f.tag}</Text>
                  </View>
                </View>
                <Text style={styles.cardDesc}>{f.desc}</Text>
              </View>
            </View>
          </View>
        ))}

        <Text style={styles.sectionHeader}>📖 Guider & tips</Text>
        {GUIDES.map((guide, i) => (
          <TouchableOpacity key={i} style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.icon}>{guide.icon}</Text>
              <View style={styles.cardText}>
                <View style={styles.titleRow}>
                  <Text style={styles.cardTitle}>{guide.title}</Text>
                  <View style={[styles.tag, { backgroundColor: TAG_COLORS[guide.tag] ?? '#636366' }]}>
                    <Text style={styles.tagText}>{guide.tag}</Text>
                  </View>
                </View>
                <Text style={styles.cardDesc}>{guide.desc}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>⚠️ Viktig information</Text>
          <Text style={styles.disclaimerBody}>
            Kapten.ai ersätter <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>inte</Text> officiella sjökort,
            godkänd navigationsutrustning eller gällande sjöfartsregler. Du som förare bär alltid det
            fulla ansvaret för säkerheten ombord.{'\n\n'}
            Vid nödsituation — ring <Text style={{ fontWeight: '700', color: '#FF3B30' }}>114 14</Text> eller
            nödanropa på <Text style={{ fontWeight: '700', color: '#FF3B30' }}>VHF kanal 16</Text>.
          </Text>
        </View>

        {/* Extern länk till SMHI */}
        <TouchableOpacity style={styles.externalCard} onPress={() => Linking.openURL('https://www.smhi.se/vader/hav-och-kust')}>
          <Text style={styles.externalTitle}>🌊 SMHI Hav & Kust</Text>
          <Text style={styles.externalDesc}>Officiella sjöprognoser och varningar från SMHI</Text>
          <Text style={styles.externalLink}>Öppna smhi.se →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { padding: 24, paddingBottom: 8 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#636366', fontSize: 14, marginTop: 4 },
  sectionHeader: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', marginHorizontal: 16, marginTop: 16, marginBottom: 4 },
  card: { marginHorizontal: 16, marginVertical: 6, backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  icon: { fontSize: 24, marginRight: 12 },
  cardText: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', flex: 1 },
  cardDesc: { color: '#EBEBF5', fontSize: 13, opacity: 0.6, lineHeight: 18 },
  tag: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 },
  tagText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  externalCard: { margin: 16, marginTop: 8, backgroundColor: '#1C2A3A', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#0A84FF44' },
  externalTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  externalDesc: { color: '#EBEBF5', fontSize: 13, opacity: 0.7, marginBottom: 8 },
  externalLink: { color: '#0A84FF', fontSize: 14, fontWeight: '600' },
  disclaimerCard: { margin: 16, marginTop: 8, backgroundColor: '#2C1A00', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#FF950044' },
  disclaimerTitle: { color: '#FF9500', fontSize: 15, fontWeight: '700', marginBottom: 8 },
  disclaimerBody: { color: '#EBEBF5', fontSize: 13, lineHeight: 20, opacity: 0.85 },
});
