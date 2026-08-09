import React, { useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { WebView } from "react-native-webview";
import { getPublishedNews } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

export default function NewsDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showSource, setShowSource] = useState(false);
  const { data, isLoading, isError } = useQuery({ queryKey: ["published-news-detail", id], queryFn: () => getPublishedNews(String(id)), enabled: Boolean(id), staleTime: 60_000 });
  const item = data?.data;

  if (isLoading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (isError || !item) return <View style={styles.center}><Text style={{ color: colors.text }}>تعذر العثور على الخبر.</Text></View>;

  if (showSource && item.sourceUrl) {
    return <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.sourceHeader, { backgroundColor: colors.primary }]}>
        <Pressable onPress={() => setShowSource(false)} style={styles.backButton}><Text style={styles.backText}>رجوع</Text></Pressable>
        <Text style={[styles.sourceTitle, { color: colors.gold, fontWeight: "800" }]}>{item.sourceName ?? "المصدر الأصلي"}</Text>
      </View>
      <WebView source={{ uri: item.sourceUrl }} style={{ flex: 1 }} startInLoadingState renderLoading={() => <View style={styles.center}><ActivityIndicator /></View>} />
    </View>;
  }

  return <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
    {item.coverImageUrl ? <Image source={{ uri: item.coverImageUrl }} style={styles.cover} /> : null}
    {item.isBreaking ? <Text style={styles.breaking}>عاجل</Text> : null}
    <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
    {item.excerpt ? <Text style={[styles.excerpt, { color: colors.text }]}>{item.excerpt}</Text> : null}
    <Text style={[styles.meta, { color: colors.text }]}>{item.sourceName ? `المصدر: ${item.sourceName}` : (item.category?.name ?? "أخبار قطر")}{item.publishedAt ? ` · ${new Date(item.publishedAt).toLocaleDateString("ar-QA")}` : ""}</Text>
    <Text style={[styles.content, { color: colors.text }]}>{item.content}</Text>
    {item.sourceUrl ? <Pressable onPress={() => setShowSource(true)} style={[styles.sourceButton, { backgroundColor: colors.primary }]}>
      <Text style={[styles.sourceButtonText, { color: colors.gold }]}>قراءة الخبر الأصلي داخل التطبيق</Text>
    </Pressable> : null}
  </ScrollView>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  container: { padding: 16, paddingBottom: 40 },
  cover: { width: "100%", aspectRatio: 16 / 9, borderRadius: 14, marginBottom: 16 },
  breaking: { color: "#B42318", fontWeight: "900", fontSize: 13, marginBottom: 6 },
  title: { fontSize: 28, lineHeight: 37, fontWeight: "900" },
  excerpt: { fontSize: 16, lineHeight: 25, marginTop: 12, opacity: 0.78 },
  meta: { fontSize: 13, marginTop: 14, opacity: 0.6 },
  content: { fontSize: 17, lineHeight: 30, marginTop: 22 },
  sourceButton: { marginTop: 26, paddingVertical: 15, paddingHorizontal: 18, borderRadius: 12, alignItems: "center" },
  sourceButtonText: { fontSize: 15, fontWeight: "800" },
  sourceHeader: { minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  backButton: { paddingVertical: 10, paddingHorizontal: 8 },
  backText: { color: "#FFFFFF", fontSize: 14 },
  sourceTitle: { fontSize: 16 },
});
