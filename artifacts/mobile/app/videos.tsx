import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

export default function VideosScreen() {
  const colors = useColors();
  return <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content}>
    <Text style={[styles.title, { color: colors.text }]}>الفيديو</Text>
    <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>أحدث المقاطع والتغطيات المرئية من أخبار أهل قطر</Text>
    <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>الفيديو قادم في هذا القسم</Text>
      <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>سيتم ربطه بمكتبة الفيديو وقنوات YouTube الموجودة لدينا.</Text>
    </View>
  </ScrollView>;
}
const styles = StyleSheet.create({ content: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 40 }, title: { fontSize: 28, fontWeight: '900', textAlign: 'right' }, subtitle: { fontSize: 13, textAlign: 'right', marginTop: 6, marginBottom: 18 }, empty: { borderWidth: 1, borderRadius: 16, padding: 24, alignItems: 'flex-end' }, emptyTitle: { fontSize: 18, fontWeight: '800' }, emptyText: { fontSize: 13, textAlign: 'right', marginTop: 8, lineHeight: 21 } });
