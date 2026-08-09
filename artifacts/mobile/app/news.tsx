import React from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { listPublishedNews } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";

export default function NewsListScreen() {
  const colors = useColors();
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({ queryKey: ["published-news", { limit: 100 }], queryFn: () => listPublishedNews({ limit: 100 }), staleTime: 60_000 });
  const items = data?.data ?? [];

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  if (isLoading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (isError) return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <Pressable onPress={goBack} style={styles.backButton} accessibilityRole="button" accessibilityLabel="رجوع">
        <Text style={[styles.backText, { color: colors.text }]}>‹ رجوع</Text>
      </Pressable>
      <Text style={{ color: colors.text }}>تعذر تحميل الأخبار حالياً.</Text>
    </View>
  );

  return <View style={{ flex: 1, backgroundColor: colors.background }}>
    <View style={styles.topBar}>
      <Pressable onPress={goBack} style={styles.backButton} accessibilityRole="button" accessibilityLabel="رجوع">
        <Text style={[styles.backText, { color: colors.text }]}>‹ رجوع</Text>
      </Pressable>
      <Text style={[styles.title, { color: colors.text }]}>آخر الأخبار</Text>
    </View>
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.list}
      data={items}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text style={{ color: colors.text }}>لا توجد أخبار منشورة حالياً.</Text>}
      renderItem={({ item }) => <Pressable style={styles.item} onPress={() => router.push({ pathname: "/news/[id]", params: { id: item.id } })}>
        {item.coverImageUrl ? <Image source={{ uri: item.coverImageUrl }} style={styles.image} /> : <View style={[styles.image, styles.placeholder]} />}
        <View style={styles.body}>
          {item.isBreaking ? <Text style={styles.breaking}>عاجل</Text> : null}
          <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
          {item.excerpt ? <Text numberOfLines={3} style={[styles.excerpt, { color: colors.text }]}>{item.excerpt}</Text> : null}
        </View>
      </Pressable>}
    />
  </View>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
  backButton: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10 },
  backText: { fontSize: 16, fontWeight: "800" },
  list: { padding: 16, gap: 14 },
  title: { fontSize: 28, fontWeight: "900", marginBottom: 8 },
  item: { flexDirection: "row", gap: 12, padding: 12, borderRadius: 14, backgroundColor: "#FFFFFF" },
  image: { width: 110, height: 86, borderRadius: 10 },
  placeholder: { backgroundColor: "#E9EDF3" },
  body: { flex: 1, gap: 6 },
  itemTitle: { fontSize: 17, fontWeight: "800", lineHeight: 23 },
  excerpt: { fontSize: 13, lineHeight: 19, opacity: 0.7 },
  breaking: { color: "#B42318", fontSize: 12, fontWeight: "900" },
});
