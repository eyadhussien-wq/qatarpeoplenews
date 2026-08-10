import React, { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { listPublishedNews } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";

const CATEGORIES = [
  { id: "all", label: "جميع الأخبار" },
  { id: "amir", label: "سمو الأمير" },
  { id: "qatar", label: "محليات" },
  { id: "economy", label: "اقتصاد" },
  { id: "sport", label: "رياضة" },
  { id: "community", label: "مجتمع" },
  { id: "world", label: "دولي" },
];

export default function NewsListScreen() {
  const colors = useColors();
  const router = useRouter();
  const [category, setCategory] = useState("all");
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = useQuery({ queryKey: ["published-news", { limit: 100 }], queryFn: () => listPublishedNews({ limit: 100 }), staleTime: 60_000 });
  const items = data?.data ?? [];
  const filteredItems = useMemo(() => category === "all" ? items : items.filter((item: any) => String(item.category ?? item.categorySlug ?? "").toLowerCase() === category), [items, category]);
  const selected = CATEGORIES.find(item => item.id === category)?.label ?? "جميع الأخبار";
  const goBack = () => router.canGoBack() ? router.back() : router.replace("/");

  if (isLoading) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator /></View>;
  if (isError) return <View style={[styles.center, { backgroundColor: colors.background }]}><Pressable onPress={goBack} style={styles.backButton}><Text style={[styles.backText, { color: colors.text }]}>‹</Text></Pressable><Text style={{ color: colors.text }}>تعذر تحميل الأخبار حالياً.</Text></View>;

  return <View style={{ flex: 1, backgroundColor: colors.background }}>
    <View style={styles.topBar}>
      <Text style={[styles.title, { color: colors.text }]}>الأخبار</Text>
      <Pressable onPress={goBack} style={styles.backButton}><Text style={[styles.backText, { color: colors.text }]}>‹</Text></Pressable>
    </View>
    <View style={styles.categoryWrap}>
      <Pressable onPress={() => setOpen(v => !v)} style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.dropdownText, { color: colors.text }]}>{selected}</Text>
        <Text style={{ color: colors.primary, fontSize: 16 }}>{open ? "⌃" : "⌄"}</Text>
      </Pressable>
      {open ? <View style={[styles.menu, { backgroundColor: colors.card, borderColor: colors.border }]}>{CATEGORIES.map(item => <Pressable key={item.id} onPress={() => { setCategory(item.id); setOpen(false); }} style={styles.option}><Text style={[styles.optionText, { color: item.id === category ? colors.primary : colors.text }]}>{item.label}</Text></Pressable>)}</View> : null}
    </View>
    <FlatList
      style={{ backgroundColor: colors.background }} contentContainerStyle={styles.list} data={filteredItems} keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text style={{ color: colors.mutedForeground, textAlign: "right", padding: 16 }}>لا توجد أخبار في هذا التصنيف حالياً.</Text>}
      renderItem={({ item }) => <Pressable style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push({ pathname: "/news/[id]", params: { id: item.id } })}>
        {item.coverImageUrl ? <Image source={{ uri: item.coverImageUrl }} style={styles.image} /> : <View style={[styles.image, styles.placeholder, { backgroundColor: colors.muted }]} />}
        <View style={styles.body}>{item.isBreaking ? <Text style={styles.breaking}>عاجل</Text> : null}<Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>{item.excerpt ? <Text numberOfLines={3} style={[styles.excerpt, { color: colors.text }]}>{item.excerpt}</Text> : null}</View>
      </Pressable>}
    />
  </View>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
  backButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 21 },
  backText: { fontSize: 32, fontWeight: "500", lineHeight: 36 },
  title: { fontSize: 28, fontWeight: "900" },
  categoryWrap: { marginHorizontal: 16, zIndex: 10 },
  dropdown: { minHeight: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dropdownText: { fontSize: 14, fontWeight: "700", textAlign: "right" },
  menu: { position: "absolute", top: 54, left: 0, right: 0, borderWidth: 1, borderRadius: 12, overflow: "hidden", elevation: 8 },
  option: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#D9DEE5" },
  optionText: { textAlign: "right", fontSize: 14, fontWeight: "600" },
  list: { padding: 16, gap: 14 },
  item: { flexDirection: "row", gap: 12, padding: 12, borderRadius: 14, borderWidth: 1 },
  image: { width: 110, height: 86, borderRadius: 10 },
  placeholder: {}, body: { flex: 1, gap: 6 }, itemTitle: { fontSize: 17, fontWeight: "800", lineHeight: 23 }, excerpt: { fontSize: 13, lineHeight: 19, opacity: 0.7 }, breaking: { color: "#B42318", fontSize: 12, fontWeight: "900" },
});
