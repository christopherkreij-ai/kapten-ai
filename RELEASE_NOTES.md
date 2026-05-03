# Kapten.ai – Release Notes

## v0.3.0 – Prognos & Favoriter
*2026-05-03*

### Nytt
- **24h-tidslinje** med 5 timboxar (vind + temp per timme)
- **Draggbar slider** – scrubba fram 24 timmar, väderkortet uppdateras i realtid
- **Favoritplatser** – spara orter med ⭐, alltid synliga som chips under sökrutan
- **Platssökning** – sök valfri ort i Sverige, växla tillbaka till GPS med 📡-knappen
- **Guide-sida** utökad med "Så här fungerar appen"-sektion

### Förbättringar
- Mer specifikt platsnamn (stadsdel + stad via reverse geocode)
- Tydliga felmeddelanden om SMHI inte svarar, med "Försök igen"-knapp

---

## v0.2.0 – Väder & Platsbehörigheter
*2026-05-03*

### Nytt
- Platstillstånd hanteras direkt efter att disclaimern godkänts
- Tydliga UI-tillstånd: laddar position / nekad / väderfel / väder klart
- "Öppna Inställningar"-knapp om användaren nekat platstjänster
- Felvisning med exakt HTTP-status om SMHI inte svarar

### Buggfixar
- Bytt SMHI API från `pmp3g/v2` (stängdes 31 mars 2026) till `snow1g/v1`
- Automatisk fallback till grövre koordinatprecision om punkten hamnar på vatten
- PostgREST schema-cache-problem löst via `create_route` RPC-funktion
- Profil skapas automatiskt (FK-krav) vid första ruttaktivering

---

## v0.1.0 – Grund & Auth
*2026-05-03*

### Nytt
- Expo Router v6 med tab-navigation (Väder / Rutt / Guide)
- Supabase-auth: e-post + lösenord, Apple OAuth, Google OAuth
- Disclaimer-modal vid första start (AsyncStorage, ej återvisas)
- WeatherCard-komponent med Beaufort-färgkodning
- AlertBanner-komponent för AI-varningar med allvarlighetsnivå
- Ruttplanering med MapView (hybrid), waypoints och polyline
- Aktiv rutt med realtime Supabase-prenumeration på varningar
- Edge function `smhi-route-monitor` – pollar SMHI + Claude Haiku var 30 min
- Nybörjarguider med kategoritaggar

---

## Teknisk stack
| Del | Val |
|-----|-----|
| Frontend | React Native + Expo SDK 54 |
| Routing | Expo Router v6 |
| Backend | Supabase (Auth + Postgres + Realtime + Edge Functions) |
| Väderdata | SMHI Open Data (snow1g/v1) |
| AI | Claude Haiku (via Anthropic API) |
| Kartor | react-native-maps (hybrid) |
| Lagring | AsyncStorage (favoriter, disclaimer) |

---

## Backlog – kommande funktioner

### Högt prio
- [ ] Stripe-integration för premiumabonnemang
- [ ] Push-notiser (Expo push tokens) för AI-varningar
- [ ] Sjöläge / dagläge-toggle (hög kontrast för solljus)

### Medel prio
- [ ] Inställningsskärm: erfarenhetsnivå + egna tröskelvärden för vind/våg
- [ ] Offline-caching av senaste väderprognoser
- [ ] Skippo-partnerintegrering (affiliate-länkar)
- [ ] Bättre ETA-beräkning per rutt (ej fast 6 knop)

### Lägre prio
- [ ] Redaktionellt innehåll till guideartiklarna
- [ ] Flerspråkigt stöd (sv/en)
- [ ] Våghöjd via SMHI marint API (FWIF)
- [ ] Android-testning och anpassning
