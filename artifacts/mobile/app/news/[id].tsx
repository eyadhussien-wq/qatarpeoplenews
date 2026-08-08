import React from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getPublishedNews } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

export default function NewsDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError } = useQuery({ queryKey: ["published-news-detail", id], queryFn: () => getPublishedNews(String(id)), enabled: Boolean(id), staleTime: 60_000 });
  const item = data?.data;

  if (isLoading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (isError || !item) return <View style={styles.center}><Text style={{ color: colors.text }}>تعذر العثور على الخبر.</Text></View>;

  return <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
    {item.coverImageUrl ? <Image source={{ uri: item.coverImageUrl }} style={styles.cover} /> : null}
    {item.isBreaking ? <Text style={styles.breaking}>عاجل</Text> : null}
    <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
    {item.excerpt ? <Text style={[styles.excerpt, { color: colors.text }]}>{item.excerpt}</Text> : null}
    <Text style={[styles.meta, { color: colors.text }]}>{item.category?.name ?? "أخبار قطر"}{item.publishedAt ? ` · ${new Date(item.publishedAt).toLocaleDateString("ar-QA")}` : ""}</Text>
    <Text style={[styles.content, { color: colors.text }]}>{item.content}</Text>
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
});
