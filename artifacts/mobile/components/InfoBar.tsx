import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

const GOLD_PRICE_URL = 'https://www.goldprice.org/gold-price-qatar.html';
const PRAYER_URL = 'https://www.islamicfinder.org/world/qatar/109223/doha-prayer-times/';

export default function InfoBar() {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Prayer times */}
        <TouchableOpacity style={styles.item} onPress={() => Linking.openURL(PRAYER_URL)}>
          <Ionicons name="time-outline" size={14} color={colors.primary} />
          <Text style={[styles.itemText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            أوقات الصلاة
          </Text>
          <Ionicons name="chevron-back" size={11} color={colors.mutedForeground} />
        </TouchableOpacity>

        <View style={[styles.sep, { backgroundColor: colors.border }]} />

        {/* Weather */}
        <View style={styles.item}>
          <Ionicons name="sunny-outline" size={14} color={colors.gold} />
          <Text style={[styles.itemText, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>الدوحة</Text>
          <Text style={[styles.tempText, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>28°C</Text>
        </View>

        <View style={[styles.sep, { backgroundColor: colors.border }]} />

        {/* Gold price */}
        <TouchableOpacity style={styles.item} onPress={() => Linking.openURL(GOLD_PRICE_URL)}>
          <Ionicons name="diamond-outline" size={14} color={colors.gold} />
          <Text style={[styles.itemText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            أسعار الذهب اليوم
          </Text>
          <Ionicons name="chevron-back" size={11} color={colors.mutedForeground} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 6,
  },
  itemText: {
    fontSize: 12,
  },
  tempText: {
    fontSize: 13,
  },
  sep: {
    width: 1,
    height: 14,
    marginHorizontal: 2,
  },
});
