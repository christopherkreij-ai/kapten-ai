import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [isRegister, setIsRegister] = useState(false);

  // ── Email / password ──────────────────────────────
  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Fyll i alla fält', 'Både e-post och lösenord krävs.');
      return;
    }
    setLoading(true);
    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        Alert.alert('🎉 Konto skapat!', 'Du är nu inloggad.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (e: any) {
      Alert.alert('Inloggningsfel', e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── OAuth (Google / Apple / Facebook) ────────────
  const handleOAuth = async (provider: 'google' | 'apple' | 'facebook') => {
    setLoadingProvider(provider);
    try {
      const redirectTo = makeRedirectUri({ scheme: 'kapten-ai' });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (!data.url) throw new Error('Ingen OAuth-URL returnerades');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const accessToken  = url.searchParams.get('access_token')
          ?? new URLSearchParams(url.hash.slice(1)).get('access_token');
        const refreshToken = url.searchParams.get('refresh_token')
          ?? new URLSearchParams(url.hash.slice(1)).get('refresh_token');
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
        }
      }
    } catch (e: any) {
      Alert.alert('Inloggningsfel', e.message);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>⚓</Text>
        <Text style={styles.title}>Kapten.ai</Text>
        <Text style={styles.subtitle}>Din intelligenta navigationsassistent</Text>

        {/* ── Social login ── */}
        <TouchableOpacity
          style={[styles.socialBtn, styles.appleBtn]}
          onPress={() => handleOAuth('apple')}
          disabled={!!loadingProvider}
        >
          <Text style={styles.socialIcon}>🍎</Text>
          <Text style={styles.socialText}>
            {loadingProvider === 'apple' ? 'Väntar...' : 'Fortsätt med Apple'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialBtn, styles.googleBtn]}
          onPress={() => handleOAuth('google')}
          disabled={!!loadingProvider}
        >
          <Text style={styles.socialIcon}>G</Text>
          <Text style={[styles.socialText, { color: '#1A1A1A' }]}>
            {loadingProvider === 'google' ? 'Väntar...' : 'Fortsätt med Google'}
          </Text>
        </TouchableOpacity>

        {/* ── Divider ── */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>eller med e-post</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ── Email / password ── */}
        <TextInput
          style={styles.input}
          placeholder="E-postadress"
          placeholderTextColor="#555"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <TextInput
          style={styles.input}
          placeholder="Lösenord (minst 6 tecken)"
          placeholderTextColor="#555"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType={isRegister ? 'newPassword' : 'password'}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleEmailAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Laddar...' : isRegister ? 'Skapa konto' : 'Logga in'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsRegister(!isRegister)} style={styles.toggle}>
          <Text style={styles.toggleText}>
            {isRegister
              ? 'Har du redan ett konto? Logga in'
              : 'Inget konto? Registrera dig gratis'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },
  logo:     { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  title:    { color: '#FFFFFF', fontSize: 32, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: '#636366', fontSize: 15, textAlign: 'center', marginBottom: 36 },

  // Social buttons
  socialBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 15, marginBottom: 12 },
  appleBtn:  { backgroundColor: '#FFFFFF' },
  googleBtn: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0' },
  socialIcon:{ fontSize: 18, marginRight: 12, width: 24, textAlign: 'center', fontWeight: '700' },
  socialText:{ fontSize: 16, fontWeight: '600', color: '#1A1A1A' },

  // Divider
  divider:     { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#2C2C2E' },
  dividerText: { color: '#636366', fontSize: 13, marginHorizontal: 12 },

  // Email inputs
  input:         { backgroundColor: '#1C1C1E', color: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, fontSize: 16 },
  button:        { backgroundColor: '#0A84FF', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  buttonDisabled:{ opacity: 0.5 },
  buttonText:    { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  toggle:        { marginTop: 20, alignItems: 'center' },
  toggleText:    { color: '#0A84FF', fontSize: 14 },
});
