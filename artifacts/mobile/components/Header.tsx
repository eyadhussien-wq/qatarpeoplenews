import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';

const UI_ICON_COLOR = '#B9A7E8';

export default function Header() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setDrawerOpen } = useApp();
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

  useEffect(() => {
    AsyncStorage.getItem('qpn-language').then((value) => {
      if (value === 'en' || value === 'ar') setLanguage(value);
    }).catch(() => {});
  }, []);

  const handleMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDrawerOpen(true);
  };

  const toggleLanguage = async () => {
    const next = language === 'ar' ? 'en' : 'ar';
    setLanguage(next);
    await AsyncStorage.setItem('qpn-language', next);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.primary, paddingTop: topPad + 8 }]}>
      <View style={styles.row}>
        <View style={styles.leftGroup}>
          <View style={[styles.logoBadge, { borderColor: colors.gold }]}>
            <Text style={[styles.logoLetter, { color: colors.gold, fontFamily: 'Inter_700Bold' }]}>ق</Text>
          </View>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/auth')} activeOpacity={0.8}>
            <Ionicons name="person-outline" size={15} color={UI_ICON_COLOR} />
            <Text style={[styles.loginText, { fontFamily: 'Inter_600SemiBold' }]}>الدخول</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.languageBtn} onPress={toggleLanguage} activeOpacity={0.8}>
            <Text style={[styles.languageText, { fontFamily: 'Inter_600SemiBold' }]}>العربية / English</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="search-outline" size={20} color={UI_ICON_COLOR} />
          </TouchableOpacity>
        </View>

        <View style={styles.rightGroup}>
          <Text style={[styles.appName, { color: '#FFFFFF', fontFamily: 'Inter_700Bold' }]}>
            {language === 'ar' ? 'أخبار أهل قطر' : 'Qatar People News'}
          </Text>
          <TouchableOpacity style={styles.iconBtn} onPress={handleMenu} activeOpacity={0.7}>
            <Ionicons name="menu" size={24} color={UI_ICON_COLOR} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 12,
    zIndex: 100,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201,160,32,0.15)',
  },
  logoLetter: { fontSize: 18 },
  appName: { fontSize: 17, textAlign: 'right', letterSpacing: 0.3 },
  iconBtn: { padding: 4 },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  loginText: { color: '#FFFFFF', fontSize: 13 },
  languageBtn: {
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  languageText: { color: '#FFFFFF', fontSize: 11 },
});
