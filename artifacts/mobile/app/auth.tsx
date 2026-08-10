import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api` : '/api';

type Language = 'ar' | 'en';

type AuthResponse = {
  token: string;
  user: { id: string; name: string; email: string; language: Language };
};

export default function AuthScreen() {
  const router = useRouter();
  const colors = useColors();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [language, setLanguage] = useState<Language>('ar');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('qpn-language').then((value) => {
      if (value === 'en' || value === 'ar') setLanguage(value);
    });
  }, []);

  const isArabic = language === 'ar';

  const toggleLanguage = async () => {
    const next = isArabic ? 'en' : 'ar';
    setLanguage(next);
    await AsyncStorage.setItem('qpn-language', next);
  };

  const submit = async () => {
    setError('');
    if (mode === 'register' && name.trim().length < 2) {
      setError(isArabic ? 'أدخل اسمك.' : 'Enter your name.');
      return;
    }
    if (!email.trim() || !password) {
      setError(isArabic ? 'أدخل البريد الإلكتروني وكلمة المرور.' : 'Enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, language }),
      });
      const data = (await response.json()) as Partial<AuthResponse> & { message?: string };
      if (!response.ok || !data.token) {
        throw new Error(data.message || (isArabic ? 'تعذر إتمام العملية.' : 'Unable to complete the request.'));
      }
      await AsyncStorage.setItem('qpn-auth-token', data.token);
      await AsyncStorage.setItem('qpn-user', JSON.stringify(data.user));
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : (isArabic ? 'حدث خطأ غير متوقع.' : 'Unexpected error.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.screen, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name={isArabic ? 'arrow-forward' : 'arrow-back'} size={22} color={colors.text} />
          </Pressable>
          <Pressable onPress={toggleLanguage} style={[styles.langButton, { borderColor: colors.border }]}>
            <Text style={[styles.langText, { color: colors.text }]}>{isArabic ? 'English' : 'العربية'}</Text>
          </Pressable>
        </View>

        <View style={styles.brand}>
          <View style={[styles.logo, { backgroundColor: colors.primary, borderColor: colors.gold }]}>
            <Text style={[styles.logoText, { color: colors.gold }]}>ق</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{isArabic ? 'حساب أخبار أهل قطر' : 'Qatar People News Account'}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isArabic ? 'سجّل حسابك للوصول إلى خدمات المنصة.' : 'Create an account to access platform services.'}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.tabs}>
            <Pressable onPress={() => setMode('login')} style={[styles.tab, mode === 'login' && { backgroundColor: colors.primary }]}>
              <Text style={[styles.tabText, { color: mode === 'login' ? '#FFFFFF' : colors.text }]}>{isArabic ? 'تسجيل الدخول' : 'Login'}</Text>
            </Pressable>
            <Pressable onPress={() => setMode('register')} style={[styles.tab, mode === 'register' && { backgroundColor: colors.primary }]}>
              <Text style={[styles.tabText, { color: mode === 'register' ? '#FFFFFF' : colors.text }]}>{isArabic ? 'إنشاء حساب' : 'Create account'}</Text>
            </Pressable>
          </View>

          {mode === 'register' && (
            <TextInput value={name} onChangeText={setName} placeholder={isArabic ? 'الاسم الكامل' : 'Full name'} placeholderTextColor={colors.textSecondary} style={[styles.input, { color: colors.text, borderColor: colors.border }]} textAlign={isArabic ? 'right' : 'left'} autoCapitalize="words" />
          )}
          <TextInput value={email} onChangeText={setEmail} placeholder={isArabic ? 'البريد الإلكتروني' : 'Email address'} placeholderTextColor={colors.textSecondary} style={[styles.input, { color: colors.text, borderColor: colors.border }]} textAlign="left" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          <TextInput value={password} onChangeText={setPassword} placeholder={isArabic ? 'كلمة المرور (8 أحرف على الأقل)' : 'Password (8+ characters)'} placeholderTextColor={colors.textSecondary} style={[styles.input, { color: colors.text, borderColor: colors.border }]} textAlign="left" secureTextEntry />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Pressable onPress={submit} disabled={loading} style={[styles.submit, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>{mode === 'login' ? (isArabic ? 'دخول' : 'Login') : (isArabic ? 'إنشاء الحساب' : 'Create account')}</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flexGrow: 1, padding: 20, paddingTop: 56, justifyContent: 'center' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  backButton: { padding: 8 },
  langButton: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  langText: { fontSize: 13, fontWeight: '600' },
  brand: { alignItems: 'center', marginBottom: 22 },
  logo: { width: 62, height: 62, borderRadius: 31, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoText: { fontSize: 30, fontWeight: '800' },
  title: { fontSize: 23, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 14, marginTop: 7, textAlign: 'center', lineHeight: 22 },
  card: { width: '100%', maxWidth: 520, alignSelf: 'center', borderWidth: 1, borderRadius: 16, padding: 18 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  tab: { flex: 1, paddingVertical: 11, borderRadius: 9, alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '700' },
  input: { minHeight: 50, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, marginBottom: 12, fontSize: 15, backgroundColor: 'transparent' },
  error: { color: '#B42318', fontSize: 13, marginBottom: 12, textAlign: 'right' },
  submit: { minHeight: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
