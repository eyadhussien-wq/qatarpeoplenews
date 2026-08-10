import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

const POSTS = [
  { id: '1', title: 'مطلوب مهندس مدني', body: 'شركة مقاولات تطلب مهندس مدني خبرة 10 سنوات ومصنف من البلدية', category: 'وظائف' },
  { id: '2', title: 'للبيع', body: 'سوق تجاري على طريق سلوى\nيمتد على مساحة 1400م\nويضم 6 محلات الدخل 252000\nمن المالك مباشرة : 66663543', category: 'عقارات' },
  { id: '3', title: 'مطلوب لشركة مقاولات', body: 'مهندس مدني\nمهندس كهرباء\nعلي دراية بكل اعمال MEP\nمحاسب\nخبرة بمجال المقاولات\n\nللتواصل ارسال السيرة الذاتية علي الايميل\nAlkhalilconst03@gmail.com\n\nA Contracting Company Is Seeking\nA Civil Engineer\nElectrical Engineer (knowledgeable in all MEP works), as well as\nAn Accountant\nwith experience in the contracting sector.\n\nTo apply, please send your CV to: Alkhalilconst03@gmail.com', category: 'وظائف' },
];

export default function CommunityScreen() {
  const colors = useColors();
  return <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content}>
    <Text style={[styles.title, { color: colors.text }]}>المجتمع</Text>
    <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>منشورات المجتمع بنفس الصيغة والأسلوب، دون نشر مباشر إلى Facebook</Text>
    {POSTS.map(post => <View key={post.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.category, { backgroundColor: colors.secondary }]}><Text style={[styles.categoryText, { color: colors.secondaryForeground }]}>{post.category}</Text></View>
      <Text style={[styles.postTitle, { color: colors.text }]}>{post.title}</Text>
      <Text style={[styles.body, { color: colors.text }]}>{post.body}</Text>
      <Text style={[styles.watermark, { color: colors.mutedForeground }]}>وسيط أخبار أهل قطر</Text>
    </View>)}
  </ScrollView>;
}
const styles = StyleSheet.create({ content: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 40 }, title: { fontSize: 28, fontWeight: '900', textAlign: 'right' }, subtitle: { fontSize: 13, textAlign: 'right', marginTop: 6, marginBottom: 18 }, card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 14 }, category: { alignSelf: 'flex-end', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, marginBottom: 10 }, categoryText: { fontSize: 11, fontWeight: '800' }, postTitle: { fontSize: 20, fontWeight: '900', textAlign: 'right', marginBottom: 8 }, body: { fontSize: 15, lineHeight: 24, textAlign: 'right' }, watermark: { fontSize: 10, textAlign: 'right', marginTop: 14, opacity: 0.75 } });
