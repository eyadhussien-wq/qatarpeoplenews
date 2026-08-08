import React from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getNewsItem } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';

export default function NewsDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['news', id],
    queryFn: ({ signal }) => getNewsItem(String(id), { signal }),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
  const item = data?.data;

  if (isLoading) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator /></View>;
  if (isError || !item) return <View style={[styles.center, { backgroundColor: colors.background }]}><Text style={[styles.message, { color: colors.text }]}>تعذر العثور على الخبر.</Text><Pressable onPress={() => refetch()}><Text style={styles.retry}>إعادة المحاولة</Text></Pressable></View>;

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <Pressable onPress={() => router.back()}><Text style={[styles.back, { color: colors.text }]}>رجوع</Text></Pressable>
      {item.coverImageUrl ? <Image source={{ uri: item.coverImageUrl }} style={styles.cover} /> : null}
      {item.isBreaking ? <Text style={styles.breaking}>عاجل</Text> : null}
      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
      {item.category?.name ? <Text style={[styles.category, { color: colors.text }]}>{item.category.name}</Text> : null}
      {item.excerpt ? <Text style={[styles.excerpt, { color: colors.text }]}>{item.excerpt}</Text> : null}
      <Text style={[styles.content, { color: colors.text }]}>{item.content}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  back: { fontSize: 15, fontWeight: '700', marginBottom: 16, textAlign: 'right' },
  cover: { width: '100%', height: 230, borderRadius: 16, marginBottom: 18 },
  breaking: { fontSize: 13, fontWeight: '900', marginBottom: 7, textAlign: 'right' },
  title: { fontSize: 28, lineHeight: 36, fontWeight: '900', textAlign: 'right' },
  category: { marginTop: 10, fontSize: 13, opacity: 0.65, textAlign: 'right' },
  excerpt: { marginTop: 16, fontSize: 17, lineHeight: 27, fontWeight: '600', textAlign: 'right' },
  content: { marginTop: 18, fontSize: 16, lineHeight: 29, textAlign: 'right' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  message: { textAlign: 'center', fontSize: 15 },
  retry: { marginTop: 12, fontWeight: '800' },
});
