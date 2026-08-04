import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';

function darken(hex: string, n = 25): string {
  const v = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (v >> 16) - n);
  const g = Math.max(0, ((v >> 8) & 0xff) - n);
  const b = Math.max(0, (v & 0xff) - n);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export default function StickyAdBanner() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { ads } = useApp();
  const [dismissed, setDismissed] = useState(false);
  const isWeb = Platform.OS === 'web';

  const now = new Date();
  const ad = ads.find(a => a.type === 'sticky' && (!a.expiresAt || new Date(a.expiresAt) > now));

  if (dismissed || !ad) return null;

  const bottomPad = isWeb ? 34 : insets.bottom;

  const handlePress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isWeb) {
      (window as Window).open(ad.linkUrl, '_blank');
    } else {
      await WebBrowser.openBrowserAsync(ad.linkUrl);
    }
  };

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <TouchableOpacity onPress={handlePress} activeOpacity={0.95} style={styles.touchable}>
        <LinearGradient
          colors={[ad.bgColor, darken(ad.bgColor)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, { paddingBottom: bottomPad + 10 }]}
        >
          <View style={[styles.adTag, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
            <Text style={[styles.adTagText, { fontFamily: 'Inter_600SemiBold' }]}>إعلان</Text>
          </View>
          <View style={styles.textBlock}>
            <Text style={[styles.title, { color: ad.textColor, fontFamily: 'Inter_700Bold' }]}>
              {ad.title}
            </Text>
            <Text style={[styles.subtitle, { color: ad.textColor, fontFamily: 'Inter_400Regular' }]}>
              {ad.subtitle}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setDismissed(true);
            }}
            style={[styles.closeBtn, { backgroundColor: 'rgba(255,255,255,0.18)' }]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={13} color={ad.textColor} />
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
  touchable: {
    width: '100%',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  adTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adTagText: {
    color: '#FFFFFF',
    fontSize: 9,
  },
  textBlock: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 1,
  },
  title: {
    fontSize: 14,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 11,
    textAlign: 'right',
    opacity: 0.85,
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
