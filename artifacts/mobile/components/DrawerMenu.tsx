import React, { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';

const DRAWER_WIDTH = 320;

type MenuItem = { id: string; label: string; icon: React.ComponentProps<typeof Ionicons>['name']; route?: string; url?: string };
type MenuSection = { title: string; items: MenuItem[] };

const MENU_SECTIONS: MenuSection[] = [
  {
    title: '🇶🇦 قطر',
    items: [
      { id: 'home', label: 'الرئيسية', icon: 'home-outline', route: '/' },
      { id: 'breaking', label: '🔴 عاجل', icon: 'flash-outline', route: '/news?breaking=true' },
      { id: 'amir', label: '👑 أخبار الأمير', icon: 'star-outline', route: '/news?category=amir' },
      { id: 'qatar', label: '🇶🇦 أخبار قطر', icon: 'flag-outline', route: '/news?category=qatar' },
      { id: 'government', label: 'الحكومة ومجلس الوزراء', icon: 'business-outline', route: '/news?category=government' },
    ],
  },
  {
    title: '📰 الأخبار',
    items: [
      { id: 'latest', label: 'آخر الأخبار', icon: 'newspaper-outline', route: '/news' },
      { id: 'popular', label: 'الأكثر قراءة', icon: 'trending-up-outline', route: '/news?sort=popular' },
      { id: 'economy', label: 'اقتصاد', icon: 'stats-chart-outline', route: '/news?category=economy' },
      { id: 'sport', label: 'رياضة', icon: 'football-outline', route: '/news?category=sport' },
      { id: 'community', label: 'مجتمع', icon: 'people-outline', route: '/news?category=community' },
      { id: 'tourism', label: 'سياحة', icon: 'map-outline', route: '/tourism-guide' },
      { id: 'gulf', label: 'قطر والخليج والعالم', icon: 'globe-outline', route: '/news?category=world' },
    ],
  },
  {
    title: '🎬 الإعلام',
    items: [
      { id: 'tv', label: 'التلفزيون المباشر', icon: 'tv-outline', route: '/tv' },
      { id: 'radio', label: 'الراديو المباشر', icon: 'radio-outline', route: '/radio' },
      { id: 'video', label: 'الفيديو', icon: 'videocam-outline', route: '/videos' },
      { id: 'podcast', label: 'البودكاست', icon: 'mic-outline', route: '/podcast' },
      { id: 'photos', label: 'الصور', icon: 'images-outline', route: '/photos' },
    ],
  },
  {
    title: '⭐ QPN',
    items: [
      { id: 'saved', label: 'المحفوظات', icon: 'bookmark-outline', route: '/saved' },
      { id: 'search', label: 'البحث', icon: 'search-outline', route: '/search' },
      { id: 'notifications', label: 'التنبيهات', icon: 'notifications-outline', route: '/notifications' },
    ],
  },
];

const FOOTER_ITEMS: MenuItem[] = [
  { id: 'about', label: 'من نحن', icon: 'information-circle-outline' },
  { id: 'addad', label: 'أضف إعلانك', icon: 'megaphone-outline', url: 'mailto:ads@ahlqatar.com' },
  { id: 'contact', label: 'اتصل بنا', icon: 'call-outline', url: 'mailto:info@ahlqatar.com' },
];

const SOCIAL = [
  { id: 'fb', icon: 'facebook-f', url: 'https://facebook.com/Qatarpeoplenews/' },
  { id: 'ig', icon: 'instagram', url: 'https://www.instagram.com/qatar_people_news/' },
  { id: 'tw', icon: 'twitter', url: 'https://x.com/QatarPeopleNews' },
  { id: 'tk', icon: 'tiktok', url: 'https://www.tiktok.com/@qatarpeoplenews' },
];

export default function DrawerMenu() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDrawerOpen, setDrawerOpen } = useApp();
  const isWeb = Platform.OS === 'web';
  const [mounted, setMounted] = useState(false);
  const translateX = useSharedValue(DRAWER_WIDTH);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (isDrawerOpen) {
      setMounted(true);
      translateX.value = withTiming(0, { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
      backdropOpacity.value = withTiming(0.55, { duration: 300 });
    } else {
      translateX.value = withTiming(DRAWER_WIDTH, { duration: 280, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }, finished => {
        if (finished) runOnJS(setMounted)(false);
      });
      backdropOpacity.value = withTiming(0, { duration: 280 });
    }
  }, [isDrawerOpen]);

  const drawerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));
  const close = () => setDrawerOpen(false);

  const openLink = (url: string) => {
    if (isWeb) window.open(url, '_blank');
    else Linking.openURL(url);
  };

  const handleItem = (item: MenuItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    close();
    if (item.route) {
      setTimeout(() => router.push(item.route as Parameters<typeof router.push>[0]), 320);
    } else if (item.url) {
      setTimeout(() => openLink(item.url!), 100);
    }
  };

  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;
  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]} pointerEvents={isDrawerOpen ? 'auto' : 'none'}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>
      <Animated.ScrollView
        style={[styles.drawer, drawerStyle, { backgroundColor: colors.primary, right: 0 }]}
        contentContainerStyle={{ paddingTop: topPad + 12, paddingBottom: bottomPad + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.drawerHeader}>
          <TouchableOpacity onPress={close} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          <Text style={[styles.drawerTitle, { color: colors.gold, fontFamily: 'Inter_700Bold' }]}>Qatar People News</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: 'rgba(201,160,32,0.25)' }]} />

        {MENU_SECTIONS.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.gold, fontFamily: 'Inter_700Bold' }]}>{section.title}</Text>
            {section.items.map(item => (
              <TouchableOpacity key={item.id} style={[styles.menuItem, { borderBottomColor: 'rgba(255,255,255,0.07)' }]} onPress={() => handleItem(item)} activeOpacity={0.65}>
                <Ionicons name={item.icon} size={19} color="rgba(255,255,255,0.58)" />
                <Text style={[styles.menuLabel, { fontFamily: 'Inter_500Medium' }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 14 }]} />
        {FOOTER_ITEMS.map(item => (
          <TouchableOpacity key={item.id} style={styles.footerItem} onPress={() => handleItem(item)} activeOpacity={0.65}>
            <Ionicons name={item.icon} size={18} color="rgba(255,255,255,0.58)" />
            <Text style={[styles.menuLabel, { fontFamily: 'Inter_500Medium' }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}

        <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 16 }]} />
        <View style={styles.socialSection}>
          <Text style={[styles.socialTitle, { fontFamily: 'Inter_400Regular' }]}>تابعنا على منصاتنا</Text>
          <View style={styles.socialRow}>
            {SOCIAL.map(s => (
              <TouchableOpacity key={s.id} style={styles.socialIcon} onPress={() => openLink(s.url)} activeOpacity={0.7}>
                <FontAwesome5 name={s.icon} size={15} color={colors.gold} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: '#000000' },
  drawer: { position: 'absolute', top: 0, bottom: 0, width: DRAWER_WIDTH },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14 },
  drawerTitle: { fontSize: 17 },
  closeBtn: { padding: 4 },
  divider: { height: 1, marginHorizontal: 20 },
  section: { paddingTop: 12 },
  sectionTitle: { textAlign: 'right', fontSize: 12, paddingHorizontal: 20, paddingVertical: 8, opacity: 0.9 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 12, paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 1 },
  footerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 12, paddingVertical: 11, paddingHorizontal: 20 },
  menuLabel: { color: '#FFFFFF', fontSize: 14, textAlign: 'right', flexShrink: 1 },
  socialSection: { paddingHorizontal: 20, alignItems: 'flex-end', gap: 12 },
  socialTitle: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  socialRow: { flexDirection: 'row', gap: 10 },
  socialIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(201,160,32,0.2)' },
});
