import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';

export default function Header() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setDrawerOpen } = useApp();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

  const handleMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDrawerOpen(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.primary, paddingTop: topPad + 8 }]}>
      <View style={styles.row}>
        {/* Left: logo badge + search */}
        <View style={styles.leftGroup}>
          <View style={[styles.logoBadge, { borderColor: colors.gold }]}>
            <Text style={[styles.logoLetter, { color: colors.gold, fontFamily: 'Inter_700Bold' }]}>ق</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="search-outline" size={20} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>
        </View>

        {/* Right: app name + menu */}
        <View style={styles.rightGroup}>
          <Text style={[styles.appName, { color: '#FFFFFF', fontFamily: 'Inter_700Bold' }]}>
            أخبار أهل قطر
          </Text>
          <TouchableOpacity style={styles.iconBtn} onPress={handleMenu} activeOpacity={0.7}>
            <Ionicons name="menu" size={24} color="#FFFFFF" />
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
    gap: 14,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  logoLetter: {
    fontSize: 18,
  },
  appName: {
    fontSize: 17,
    textAlign: 'right',
    letterSpacing: 0.3,
  },
  iconBtn: {
    padding: 4,
  },
});
