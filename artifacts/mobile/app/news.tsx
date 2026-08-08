import React from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getNews } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';

export default function NewsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['news', 'all'],
    queryFn: ({ signal }) => getNews({ limit: 100, signal }),
    staleTime: 60_000,
  });
  const items = data?.data ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}><Text style={[styles.back, { color: colors.text }]}>رجوع</Text></Pressable>
        <Text style={[styles.title, { color: colors.text }]}>الأخبار</Text>
        <View style={styles.spacer} />
      </View>
      {isLoading ? <View style={styles.center}><ActivityIndicator /></View> : isError ? (
        <View style={styles.center}><Text style={[styles.message, { color: colors.text }]}>تعذر تحميل الأخبار.</Text><Pressable onPress={() => refetch()}><Text style={styles.retry}>إعادة المحاولة</Text></Pressable></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push({ pathname: '/news/[id]', params: { id: item.id } })}>
              {item.coverImageUrl ? <Image source={{ uri: item.coverImageUrl }} style={styles.image} /> : null}
              <View style={styles.body}>
                {item.isBreaking ? <Text style={styles.breaking}>عاجل</Text> : null}
                <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                {item.excerpt ? <Text numberOfLines={2} style={[styles.excerpt, { color: colors.text }]}>{item.excerpt}</Text> : null}
                {item.categoryName ? <Text style={[styles.category, { color: colors.text }]}>{item.categoryName}</Text> : null}
              </View>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={[styles.message, { color: colors.text }]}>لا توجد أخبار منشورة حالياً.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { minHeight: 64, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: '800' },
  back: { fontSize: 15, fontWeight: '700' },
  spacer: { width: 40 },
  list: { padding: 16, gap: 12 },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, overflow: 'hidden', flexDirection: 'row-reverse', minHeight: 118 },
  image: { width: 130, minHeight: 118 },
  body: { flex: 1, padding: 13 },
  breaking: { fontSize: 11, fontWeight: '900', marginBottom: 4, textAlign: 'right' },
  cardTitle: { fontSize: 17, lineHeight: 23, fontWeight: '800', textAlign: 'right' },
  excerpt: { fontSize: 13, lineHeight: 19, opacity: 0.7, marginTop: 5, textAlign: 'right' },
  category: { fontSize: 11, opacity: 0.6, marginTop: 7, textAlign: 'right' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  message: { textAlign: 'center', fontSize: 15 },
  retry: { marginTop: 12, fontWeight: '800' },
});
