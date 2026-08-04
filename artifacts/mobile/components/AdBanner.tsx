import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';

function darken(hex: string, amount = 20): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (n >> 16) - amount);
  const g = Math.max(0, ((n >> 8) & 0xff) - amount);
  const b = Math.max(0, (n & 0xff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export default function AdBanner() {
  const colors = useColors();
  const { ads } = useApp();
  const now = new Date();

  const ad = ads.find(a => a.type === 'premium' && (!a.expiresAt || new Date(a.expiresAt) > now));
  if (!ad) return null;

  const handlePress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'web') {
      (window as Window).open(ad.linkUrl, '_blank');
    } else {
      await WebBrowser.openBrowserAsync(ad.linkUrl);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={[styles.container, { borderRadius: colors.radius }]}>
      <LinearGradient
        colors={[ad.bgColor, darken(ad.bgColor, 30)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, { borderRadius: colors.radius }]}
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
        <View style={[styles.arrowCircle, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
          <Ionicons name="chevron-back" size={18} color={ad.textColor} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 10,
  },
  adTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  adTagText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  textBlock: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 2,
  },
  title: {
    fontSize: 16,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'right',
    opacity: 0.85,
  },
  arrowCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
