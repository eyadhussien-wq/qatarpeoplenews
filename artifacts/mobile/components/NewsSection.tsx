import React from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { listPublishedNews } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";

export default function NewsSection() {
  const colors = useColors();
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["published-news", { limit: 6 }],
    queryFn: () => listPublishedNews({ limit: 6 }),
    staleTime: 60_000,
  });

  const items = data?.data ?? [];
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>آخر الأخبار</Text>
        <Pressable onPress={() => router.push("/news") }>
          <Text style={[styles.more, { color: colors.primary }]}>عرض الكل</Text>
        </Pressable>
      </View>
      {isLoading ? <ActivityIndicator /> : isError ? <Text style={[styles.muted, { color: colors.text }]}>تعذر تحميل الأخبار حالياً</Text> : null}
      {items.map((item) => (
        <Pressable key={item.id} style={styles.item} onPress={() => router.push(`/news/${item.id}`)}>
          {item.coverImageUrl ? <Image source={{ uri: item.coverImageUrl }} style={styles.image} /> : <View style={[styles.image, styles.placeholder]} />}
          <View style={styles.body}>
            {item.isBreaking ? <Text style={styles.breaking}>عاجل</Text> : null}
            <Text numberOfLines={2} style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
            {item.excerpt ? <Text numberOfLines={2} style={[styles.muted, { color: colors.text }]}>{item.excerpt}</Text> : null}
          </View>
        </Pressable>
      ))}
      {!isLoading && !isError && items.length === 0 ? <Text style={[styles.muted, { color: colors.text }]}>لا توجد أخبار منشورة حالياً</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20, paddingHorizontal: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "800" },
  more: { fontSize: 14, fontWeight: "700" },
  item: { flexDirection: "row", gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#D9DEE7" },
  image: { width: 92, height: 72, borderRadius: 10 },
  placeholder: { backgroundColor: "#E9EDF3" },
  body: { flex: 1, gap: 5 },
  itemTitle: { fontSize: 16, fontWeight: "800", lineHeight: 22 },
  muted: { fontSize: 13, lineHeight: 19, opacity: 0.72 },
  breaking: { alignSelf: "flex-start", color: "#B42318", fontWeight: "800", fontSize: 12 },
});
