import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

const JOBS = [
  { title: 'مطلوب مهندس مدني', body: 'شركة مقاولات تطلب مهندس مدني خبرة 10 سنوات ومصنف من البلدية' },
  { title: 'مطلوب لشركة مقاولات', body: 'مهندس مدني\nمهندس كهرباء\nعلي دراية بكل اعمال MEP\nمحاسب\nخبرة بمجال المقاولات\n\nللتواصل ارسال السيرة الذاتية علي الايميل\nAlkhalilconst03@gmail.com\n\nA Contracting Company Is Seeking\nA Civil Engineer\nElectrical Engineer (knowledgeable in all MEP works), as well as\nAn Accountant\nwith experience in the contracting sector.\n\nTo apply, please send your CV to: Alkhalilconst03@gmail.com' },
];

export default function JobsScreen() {
  const colors = useColors();
  return <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content}>
    <Text style={[styles.title, { color: colors.text }]}>عروض وظائف</Text>
    <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>وظائف ومنشورات التوظيف في قطر</Text>
    {JOBS.map((job, i) => <View key={i} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.title2, { color: colors.text }]}>{job.title}</Text><Text style={[styles.body, { color: colors.text }]}>{job.body}</Text><Text style={[styles.watermark, { color: colors.mutedForeground }]}>وسيط أخبار أهل قطر</Text></View>)}
  </ScrollView>;
}
const styles = StyleSheet.create({ content: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 40 }, title: { fontSize: 28, fontWeight: '900', textAlign: 'right' }, subtitle: { fontSize: 13, textAlign: 'right', marginTop: 6, marginBottom: 18 }, card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 14 }, title2: { fontSize: 20, fontWeight: '900', textAlign: 'right', marginBottom: 8 }, body: { fontSize: 15, lineHeight: 24, textAlign: 'right' }, watermark: { fontSize: 10, textAlign: 'right', marginTop: 14 } });
