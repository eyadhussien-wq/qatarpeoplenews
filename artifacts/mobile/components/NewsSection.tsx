import React from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { listPublishedNews } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";

function homepageImportance(title: string, sourceName: string | null | undefined, isBreaking: boolean) {
  const text = title.toLowerCase();
  if (isBreaking) return 100;
  const important = /قرار|مرسوم|قانون|توجيه|يصدر|افتتاح|يبحث|مباحثات|اتفاق|اتفاقية|زيارة|يلتقي|استقبل|يستقبل|اتصال|يتلقى اتصال|مؤتمر|قمة|أمن|دفاع|اقتصاد|استثمار|طاقة|غاز|نفط|قطر للطاقة|الأمم المتحدة|مجلس التعاون|غزة|فلسطين|إيران|الولايات المتحدة|الرئيس|رئيس الوزراء|ملك|وزير|دولي|عاجل|هام/.test(text);
  let score = important ? 60 : 0;
  if (sourceName === "QNA") score += 12;
  if (sourceName === "الديوان الأميري") score += 10;
  if (sourceName === "الجزيرة") score += 8;
  if (sourceName === "الشرق" || sourceName === "العرب") score += 5;
  if (sourceName === "الديوان الأميري" && /يهنئ|تهنئ|يعزي|تعزي|برقية/.test(text)) score -= 35;
  return score;
}

export default function NewsSection() {
  const colors = useColors();
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    // Pull a wider recent window, then curate locally so the homepage is not an RSS dump.
    queryKey: ["published-news-homepage", { limit: 30 }],
    queryFn: () => listPublishedNews({ limit: 30 }),
    staleTime: 60_000,
  });

  const items = (data?.data ?? []).filter((item) => homepageImportance(item.title, item.sourceName, item.isBreaking) >= 60).slice(0, 6);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>أهم وآخر الأخبار</Text>
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
            {item.sourceName ? <Text numberOfLines={1} style={[styles.source, { color: colors.text }]}>{item.sourceName}</Text> : null}
          </View>
        </Pressable>
      ))}
      {!isLoading && !isError && items.length === 0 ? <Text style={[styles.muted, { color: colors.text }]}>لا توجد أخبار رئيسية منشورة حالياً</Text> : null}
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
  source: { fontSize: 11, fontWeight: "700", opacity: 0.55 },
  breaking: { alignSelf: "flex-start", color: "#B42318", fontWeight: "800", fontSize: 12 },
});
