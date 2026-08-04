import React, { useEffect, useRef, useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';

const DRAWER_WIDTH = 300;

const MENU_ITEMS = [
  { id: 'about', label: 'من نحن', icon: 'information-circle-outline' as const },
  { id: 'addad', label: 'أضف إعلانك', icon: 'megaphone-outline' as const, url: 'mailto:ads@ahlqatar.com' },
  { id: 'contact', label: 'اتصل بنا', icon: 'call-outline' as const, url: 'mailto:info@ahlqatar.com' },
  { id: 'notif', label: 'ضبط التنبيهات', icon: 'notifications-outline' as const },
  { id: 'admin', label: 'لوحة التحكم', icon: 'settings-outline' as const, route: '/admin' },
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

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const close = () => setDrawerOpen(false);

  const openLink = (url: string) => {
    if (isWeb) (window as Window).open(url, '_blank');
    else Linking.openURL(url);
  };

  const handleItem = (item: typeof MENU_ITEMS[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    close();
    if ('route' in item && item.route) {
      setTimeout(() => router.push(item.route as Parameters<typeof router.push>[0]), 320);
    } else if ('url' in item && item.url) {
      setTimeout(() => openLink(item.url as string), 100);
    }
  };

  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]} pointerEvents={isDrawerOpen ? 'auto' : 'none'}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      {/* Drawer panel */}
      <Animated.View
        style={[
          styles.drawer,
          drawerStyle,
          {
            backgroundColor: colors.primary,
            paddingTop: topPad + 12,
            paddingBottom: bottomPad + 16,
            right: 0,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.drawerHeader}>
          <TouchableOpacity onPress={close} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          <Text style={[styles.drawerTitle, { color: colors.gold, fontFamily: 'Inter_700Bold' }]}>
            أخبار أهل قطر
          </Text>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: 'rgba(201,160,32,0.25)' }]} />

        {/* Menu items */}
        <View style={styles.menuList}>
          {MENU_ITEMS.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, { borderBottomColor: 'rgba(255,255,255,0.07)' }]}
              onPress={() => handleItem(item)}
              activeOpacity={0.65}
            >
              <Ionicons name={item.icon} size={19} color="rgba(255,255,255,0.55)" />
              <Text style={[styles.menuLabel, { fontFamily: 'Inter_500Medium' }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 16 }]} />

        {/* Social section */}
        <View style={styles.socialSection}>
          <Text style={[styles.socialTitle, { color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_400Regular' }]}>
            تابعنا على منصاتنا
          </Text>
          <View style={styles.socialRow}>
            {SOCIAL.map(s => (
              <TouchableOpacity
                key={s.id}
                style={[styles.socialIcon, { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(201,160,32,0.2)' }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openLink(s.url); }}
                activeOpacity={0.7}
              >
                <FontAwesome5 name={s.icon} size={15} color={colors.gold} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: '#000000',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  drawerTitle: {
    fontSize: 17,
  },
  closeBtn: {
    padding: 4,
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
  },
  menuList: {
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  menuLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    textAlign: 'right',
  },
  socialSection: {
    paddingHorizontal: 20,
    alignItems: 'flex-end',
    gap: 12,
  },
  socialTitle: {
    fontSize: 12,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 10,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
