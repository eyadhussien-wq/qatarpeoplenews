import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import OffersBanner from '@/components/OffersBanner';
import { useColors } from '@/hooks/useColors';

export default function OffersScreen() {
  const colors = useColors();
  return <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content}>
    <Text style={[styles.title, { color: colors.text }]}>عروض قطر</Text>
    <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>عروض رسمية من الشركات والمواقع الرسمية</Text>
    <OffersBanner />
  </ScrollView>;
}
const styles = StyleSheet.create({ content: { paddingTop: 60, paddingBottom: 40 }, title: { fontSize: 28, fontWeight: '900', textAlign: 'right', marginHorizontal: 16 }, subtitle: { fontSize: 13, textAlign: 'right', marginHorizontal: 16, marginTop: 6, marginBottom: 18 } });
