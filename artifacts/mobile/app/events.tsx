import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

const EVENTS = [
  { title: 'فعاليات قطر', text: 'المعارض والمؤتمرات والأنشطة والمناسبات التي تقام في دولة قطر.' },
  { title: 'قريباً', text: 'سيتم تحديث هذه الصفحة بالفعاليات الرسمية ومواعيدها وروابطها.' },
];

export default function EventsScreen() {
  const colors = useColors();
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>فعاليات قطر</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>أهم الفعاليات والأنشطة والمعارض والمؤتمرات في قطر</Text>
      {EVENTS.map((event, index) => (
        <View key={index} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.icon, { backgroundColor: 'rgba(185,167,232,0.14)' }]}>
            <Text style={styles.iconText}>◷</Text>
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{event.title}</Text>
          <Text style={[styles.cardText, { color: colors.mutedForeground }]}>{event.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '900', textAlign: 'right' },
  subtitle: { fontSize: 13, textAlign: 'right', marginTop: 6, marginBottom: 18, lineHeight: 20 },
  card: { borderWidth: 1, borderRadius: 16, padding: 18, marginBottom: 14, alignItems: 'flex-end' },
  icon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  iconText: { color: '#B9A7E8', fontSize: 24, fontWeight: '700' },
  cardTitle: { fontSize: 18, fontWeight: '800', textAlign: 'right' },
  cardText: { fontSize: 13, lineHeight: 21, textAlign: 'right', marginTop: 6 },
});
