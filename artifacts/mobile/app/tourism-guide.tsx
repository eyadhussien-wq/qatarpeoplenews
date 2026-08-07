import React, { useMemo, useState } from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

const categories = [
  { id: 'culture', label: '🏛️ معالم وثقافة', items: [
    ['متحف الفن الإسلامي', 'تحف فنية من العالم الإسلامي', 'https://mia.org.qa/ar/', 'Islamic Art Museum Doha'],
    ['متحف قطر الوطني', 'رحلة في تاريخ قطر وثقافتها', 'https://nmoq.org.qa/ar/', 'National Museum Qatar'],
    ['متحف الفن الحديث (Mathaf)', 'الفن العربي الحديث والمعاصر', 'https://mathaf.org.qa/', 'Mathaf Doha'],
    ['متحف 3-2-1 الرياضي', 'تجربة الرياضة والإنجاز', 'https://321qatar.org/', '321 Qatar Olympic Museum'],
    ['مكتبة قطر الوطنية', 'معرفة وإلهام للجميع', 'https://www.qnl.qa/ar', 'Qatar National Library'],
  ]},
  { id: 'nature', label: '🏜️ طبيعة ومغامرات', items: [
    ['خور العديد', 'البحر يلتقي بالصحراء', 'https://visitqatar.com/ar', 'Inland Sea Qatar'],
    ['الجزيرة الأرجوانية', 'طبيعة وطيور ومناظر هادئة', 'https://visitqatar.com/ar', 'Purple Island Qatar'],
    ['كهف دحل المسفر', 'مغامرة في أعماق الصحراء', 'https://visitqatar.com/ar', 'Dahl Al Misfir Qatar'],
    ['محمية الدوسري', 'حياة برية وتجربة عائلية', 'https://www.aldosari.qa/', 'Al Dosari Zoo Qatar'],
  ]},
  { id: 'leisure', label: '🎡 ترفيه وشواطئ', items: [
    ['جزيرة المها', 'ترفيه شتوي وتجارب عائلية', 'https://www.almaha-island.com/', 'Al Maha Island Qatar'],
    ['شاطئ 974 وقطيفان', 'شاطئ ومغامرات مائية', 'https://www.meryalwaterpark.com/', 'Meryal Waterpark Qatar'],
    ['درب لوسيل', 'ممشى نابض بالحياة', 'https://www.lusail.com/', 'Lusail Boulevard Qatar'],
    ['حديقة أسباير', 'مساحات خضراء ونشاطات مفتوحة', 'https://www.aspirezone.qa/', 'Aspire Park Qatar'],
  ]},
  { id: 'shopping', label: '🛍️ أسواق وتسوق', items: [
    ['سوق الوكرة القديم', 'تراث على الواجهة البحرية', 'https://visitqatar.com/ar', 'Souq Al Wakra Qatar'],
    ['فيندوم مول وقطر مول', 'تسوق وترفيه فاخر', 'https://placevendomeqatar.com/', 'Place Vendome Qatar'],
    ['براحة مشيرب', 'ساحة ثقافية في قلب الدوحة', 'https://www.msheireb.com/ar/', 'Barahat Msheireb'],
  ]},
] as const;
type CategoryId = (typeof categories)[number]['id'];

export default function TourismGuideScreen() {
  const [category, setCategory] = useState<CategoryId>(categories[0].id);
  const current = useMemo(() => categories.find(item => item.id === category) ?? categories[0], [category]);
  const visit = async (url: string) => {
    await WebBrowser.openBrowserAsync(url, { toolbarColor: '#580024', controlsColor: '#FFD700', dismissButtonStyle: 'close', readerMode: false });
  };
  const map = (name: string) => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`);
  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: 'دليل قطر السياحي', headerStyle: { backgroundColor: '#580024' }, headerTintColor: '#FFD700' }} />
      <Text style={styles.title}>🇶🇦 دليل قطر السياحي</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {categories.map(item => <TouchableOpacity key={item.id} onPress={() => setCategory(item.id)} style={[styles.tab, category === item.id && styles.activeTab]}><Text style={[styles.tabText, category === item.id && styles.activeTabText]}>{item.label}</Text></TouchableOpacity>)}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.list}>
        {current.items.map(([name, description, url, query]) => (
          <View key={name} style={styles.item}>
            <View style={styles.thumb}><Ionicons name="location" size={24} color="#FFD700" /></View>
            <View style={styles.itemCopy}><Text style={styles.name}>{name}</Text><Text style={styles.description}>{description}</Text>
              <View style={styles.actions}><TouchableOpacity style={styles.visit} onPress={() => void visit(url)}><Text style={styles.visitText}>زيارة الموقع</Text></TouchableOpacity><TouchableOpacity style={styles.map} onPress={() => void map(query)}><Text style={styles.mapText}>الموقع على الخريطة</Text></TouchableOpacity></View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F5F0' },
  title: { color: '#580024', fontSize: 22, fontWeight: '900', textAlign: 'right', padding: 18 },
  tabs: { paddingHorizontal: 14, gap: 8, paddingBottom: 12 },
  tab: { backgroundColor: '#EFE3D5', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 9 },
  activeTab: { backgroundColor: '#FFD700' }, tabText: { color: '#580024', fontSize: 12, fontWeight: '700' }, activeTabText: { color: '#36050C' },
  list: { padding: 14, gap: 10 }, item: { flexDirection: 'row', backgroundColor: '#FFFDF9', borderRadius: 14, padding: 10, minHeight: 106, elevation: 2 }, thumb: { width: 82, borderRadius: 10, backgroundColor: '#580024', alignItems: 'center', justifyContent: 'center' }, itemCopy: { flex: 1, paddingHorizontal: 10 }, name: { color: '#36050C', fontSize: 15, fontWeight: '900', textAlign: 'right' }, description: { color: '#80666B', fontSize: 11, textAlign: 'right', marginTop: 3 }, actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 6, marginTop: 10 }, visit: { backgroundColor: '#FFD700', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 6 }, visitText: { color: '#580024', fontSize: 10, fontWeight: '800' }, map: { borderWidth: 1, borderColor: '#D4AF37', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 6 }, mapText: { color: '#8A6420', fontSize: 10, fontWeight: '800' },
});