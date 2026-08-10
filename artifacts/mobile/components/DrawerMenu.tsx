import React, { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';

const DRAWER_WIDTH = 300;
type MenuItem = { id: string; label: string; icon: React.ComponentProps<typeof Ionicons>['name']; route: string };

const MAIN_ITEMS: MenuItem[] = [
  { id: 'home', label: 'الرئيسية', icon: 'home-outline', route: '/' },
  { id: 'news', label: 'الأخبار', icon: 'newspaper-outline', route: '/news' },
  { id: 'live', label: 'البث المباشر', icon: 'tv-outline', route: '/live' },
  { id: 'offers', label: 'عروض قطر', icon: 'gift-outline', route: '/offers' },
  { id: 'community', label: 'المجتمع', icon: 'people-outline', route: '/community' },
  { id: 'video', label: 'الفيديو', icon: 'videocam-outline', route: '/videos' },
  { id: 'jobs', label: 'عروض وظائف', icon: 'briefcase-outline', route: '/jobs' },
];

export default function DrawerMenu() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDrawerOpen, setDrawerOpen } = useApp();
  const { themeMode, setThemeMode } = useTheme();
  const isWeb = Platform.OS === 'web';
  const [mounted, setMounted] = useState(false);
  const translateX = useSharedValue(DRAWER_WIDTH);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (isDrawerOpen) {
      setMounted(true);
      translateX.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) });
      backdropOpacity.value = withTiming(0.52, { duration: 280 });
    } else {
      translateX.value = withTiming(DRAWER_WIDTH, { duration: 240 }, finished => {
        if (finished) runOnJS(setMounted)(false);
      });
      backdropOpacity.value = withTiming(0, { duration: 240 });
    }
  }, [isDrawerOpen]);

  const drawerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));
  const close = () => setDrawerOpen(false);
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const go = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    close();
    setTimeout(() => router.push(route as Parameters<typeof router.push>[0]), 260);
  };

  const openUrl = (url: string) => {
    if (isWeb) window.open(url, '_blank');
    else Linking.openURL(url);
  };

  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]} pointerEvents={isDrawerOpen ? 'auto' : 'none'}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      <Animated.ScrollView
        style={[styles.drawer, drawerStyle, { backgroundColor: colors.card, right: 0 }]}
        contentContainerStyle={{ paddingTop: topPad + 12, paddingBottom: bottomPad + 18 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={close} style={styles.closeButton} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={colors.mutedForeground} />
          </TouchableOpacity>
          <View style={styles.brand}>
            <View style={[styles.logo, { backgroundColor: colors.primary }]}><Text style={[styles.logoText, { color: colors.gold }]}>ق</Text></View>
            <View>
              <Text style={[styles.title, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>أخبار أهل قطر</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Qatar People News</Text>
            </View>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>التنقل</Text>

        {MAIN_ITEMS.map((item, index) => (
          <TouchableOpacity key={item.id} style={[styles.menuItem, index === 0 && styles.firstItem]} onPress={() => go(item.route)} activeOpacity={0.72}>
            <Ionicons name={item.icon} size={21} color={colors.primary} />
            <Text style={[styles.menuText, { color: colors.text, fontFamily: 'Inter_600SemiBold' }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>الإعدادات</Text>

        <View style={styles.settingRow}>
          <Ionicons name="moon-outline" size={20} color={colors.primary} />
          <Text style={[styles.menuText, { color: colors.text, fontFamily: 'Inter_500Medium' }]}>المظهر</Text>
        </View>
        <View style={[styles.segment, { backgroundColor: colors.muted }]}>
          {([
            ['light', 'فاتح', 'sunny-outline'],
            ['dark', 'داكن', 'moon-outline'],
            ['system', 'النظام', 'phone-portrait-outline'],
          ] as const).map(([mode, label, icon]) => (
            <TouchableOpacity key={mode} onPress={() => setThemeMode(mode)} style={[styles.segmentButton, themeMode === mode && { backgroundColor: colors.card }]} activeOpacity={0.75}>
              <Ionicons name={icon} size={15} color={themeMode === mode ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.segmentText, { color: themeMode === mode ? colors.primary : colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.settingItem} onPress={() => openUrl('mailto:info@ahlqatar.com')} activeOpacity={0.7}>
          <Ionicons name="mail-outline" size={19} color={colors.primary} />
          <Text style={[styles.menuText, { color: colors.text, fontFamily: 'Inter_500Medium' }]}>تواصل معنا</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={() => openUrl('mailto:ads@ahlqatar.com')} activeOpacity={0.7}>
          <Ionicons name="megaphone-outline" size={19} color={colors.primary} />
          <Text style={[styles.menuText, { color: colors.text, fontFamily: 'Inter_500Medium' }]}>أعلن معنا</Text>
        </TouchableOpacity>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>أخبار أهل قطر</Text>
          <Text style={[styles.footerText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>إصدار التطبيق</Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: '#000000' },
  drawer: { position: 'absolute', top: 0, bottom: 0, width: DRAWER_WIDTH, elevation: 20, shadowColor: '#000', shadowOffset: { width: -4, height: 0 }, shadowOpacity: 0.18, shadowRadius: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingBottom: 16 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 20, fontWeight: '900' },
  title: { fontSize: 16, textAlign: 'right' },
  subtitle: { fontSize: 10, marginTop: 2, textAlign: 'right' },
  closeButton: { padding: 6 },
  divider: { height: 1, marginHorizontal: 18, marginVertical: 10 },
  sectionLabel: { fontSize: 11, textAlign: 'right', paddingHorizontal: 20, paddingVertical: 6 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 14, paddingVertical: 13, paddingHorizontal: 20, borderRadius: 10, marginHorizontal: 10 },
  firstItem: { backgroundColor: 'rgba(138,21,56,0.07)' },
  menuText: { fontSize: 14, textAlign: 'right', flex: 1 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 14, paddingHorizontal: 20, paddingVertical: 8 },
  segment: { flexDirection: 'row', marginHorizontal: 18, borderRadius: 10, padding: 3 },
  segmentButton: { flex: 1, minHeight: 38, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 3 },
  segmentText: { fontSize: 10 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 14, paddingHorizontal: 20, paddingVertical: 12 },
  footer: { marginHorizontal: 20, marginTop: 18, paddingTop: 12, alignItems: 'flex-end', gap: 4, borderTopWidth: 1 },
  footerText: { fontSize: 10 },
});
