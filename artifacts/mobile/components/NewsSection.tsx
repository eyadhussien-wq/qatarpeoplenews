import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getNews } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';

export default function NewsSection() {
  const colors = useColors();
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['news', 'home'],
    queryFn: ({ signal }) => getNews({ limit: 6, signal }),
    staleTime: 60_000,
  });

  const items = data?.data ?? [];
  if (!isLoading && items.length === 0 && !isError) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>آخر الأخبار</Text>
        <Pressable onPress={() => router.push('/news')} hitSlop={8}>
          <Text style={styles.more}>عرض الكل</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator accessibilityLabel="جاري تحميل الأخبار" />
      ) : isError ? (
        <Text style={[styles.muted, { color: colors.text }]}>تعذر تحميل الأخبار حالياً.</Text>
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push({ pathname: '/news/[id]', params: { id: item.id } })}
            >
              {item.coverImageUrl ? <Image source={{ uri: item.coverImageUrl }} style={styles.image} /> : null}
              <View style={styles.body}>
                {item.isBreaking ? <Text style={styles.breaking}>عاجل</Text> : null}
                <Text numberOfLines={2} style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                {item.categoryName ? <Text style={[styles.category, { color: colors.text }]}>{item.categoryName}</Text> : null}
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 18 },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800' },
  more: { fontSize: 14, fontWeight: '700' },
  list: { gap: 10 },
  card: { minHeight: 96, borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, overflow: 'hidden', flexDirection: 'row-reverse' },
  image: { width: 112, height: 96 },
  body: { flex: 1, padding: 12, justifyContent: 'center' },
  cardTitle: { fontSize: 16, lineHeight: 22, fontWeight: '700', textAlign: 'right' },
  category: { fontSize: 12, opacity: 0.65, marginTop: 6, textAlign: 'right' },
  breaking: { alignSelf: 'flex-end', fontSize: 11, fontWeight: '800', marginBottom: 4 },
  muted: { fontSize: 14, textAlign: 'right', paddingVertical: 12 },
});
