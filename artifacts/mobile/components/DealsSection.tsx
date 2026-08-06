import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { DEFAULT_DEALS_DATA, useApp, type DealCategory } from '@/context/AppContext';

const tabs: { key: DealCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'الكل' }, { key: 'supermarkets', label: 'سوبرماركت' },
  { key: 'coupons', label: 'كوبونات' }, { key: 'travel', label: 'طيران وفنادق' },
  { key: 'official_prices', label: 'أسعار رسمية' },
];

function metadata(deal: (typeof DEFAULT_DEALS_DATA)[number]) {
  if (deal.category === 'official_prices') return 'تحديث يومي مباشر';
  if (deal.category === 'travel') return 'عرض حصري محدود';
  const expiry = new Date(deal.expiryDate);
  if (Number.isNaN(expiry.getTime())) return 'عرض أسبوعي';
  const days = Math.ceil((expiry.getTime() - Date.now()) / 86400000);
  if (days <= 0) return 'انتهى العرض';
  if (days <= 7) return `متبقي ${days} أيام`;
  return `ينتهي ${expiry.toLocaleDateString('ar-QA', { weekday: 'long' })}`;
}

export default function DealsSection() {
  const colors = useColors();
  const { savedDeals, toggleSavedDeal } = useApp();
  const [tab, setTab] = useState<DealCategory | 'all'>('all');
  const [toast, setToast] = useState(false);
  const deals = useMemo(() => DEFAULT_DEALS_DATA.filter(deal => tab === 'all' || deal.category === tab), [tab]);

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Ionicons name="pricetags" size={21} color={colors.gold} />
        <Text style={[styles.headingText, { color: colors.foreground }]}>العروض والصفقات</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {tabs.map(item => <TouchableOpacity key={item.key} onPress={() => setTab(item.key)} style={[styles.tab, tab === item.key && styles.activeTab]}><Text style={[styles.tabText, tab === item.key && styles.activeTabText]}>{item.label}</Text></TouchableOpacity>)}
      </ScrollView>
      {deals.map(deal => {
        const status = metadata(deal);
        const expired = status === 'انتهى العرض';
        const localImage = deal.category === 'travel'
          ? require('@/assets/images/hero-doha.jpg')
          : deal.category === 'official_prices'
            ? require('@/assets/images/hero-stadium.jpg')
            : require('@/assets/images/icon_2.png');
        return <View key={deal.id} style={styles.card}>
          <Image source={localImage} style={styles.image} resizeMode="cover" />
          <View style={styles.imageShade} />
          <View style={styles.cardBody}>
            <View style={styles.row}><Text style={styles.store}>{deal.storeName}</Text><TouchableOpacity onPress={() => void toggleSavedDeal(deal.id)}><Ionicons name={savedDeals.includes(deal.id) ? 'heart' : 'heart-outline'} size={22} color={savedDeals.includes(deal.id) ? '#B32645' : '#8A6420'} /></TouchableOpacity></View>
            <Text style={styles.title}>{deal.title}</Text>
            <View style={styles.badges}>
              {deal.isVerifiedGov && <View style={styles.verified}><Ionicons name="checkmark-circle" size={13} color="#FFF8D6" /><Text style={styles.verifiedText}>مُعتمد رسمياً</Text></View>}
              <Text style={[styles.expiry, expired && styles.expired]}>{status}</Text>
            </View>
            <View style={styles.actions}>
              {deal.code && <TouchableOpacity style={styles.codeButton} onPress={() => { void Clipboard.setStringAsync(deal.code!); setToast(true); setTimeout(() => setToast(false), 2200); }}><Ionicons name="copy-outline" size={14} color="#FFD700" /><Text style={styles.codeText}>{deal.code}</Text></TouchableOpacity>}
              <TouchableOpacity style={styles.action} onPress={() => void WebBrowser.openBrowserAsync(deal.dealUrl, { toolbarColor: '#FFD700', controlsColor: '#4A0E17', showTitle: true })}><Text style={styles.actionText}>{deal.category === 'travel' ? 'احجز الآن' : 'مشاهدة العرض'}</Text><Ionicons name="arrow-back" size={16} color="#4A0E17" /></TouchableOpacity>
            </View>
          </View>
        </View>;
      })}
      {toast && <TouchableOpacity style={styles.toast} onPress={() => setToast(false)}><Ionicons name="checkmark-circle" size={18} color="#0F2D22" /><Text>تم نسخ الكود بنجاح!</Text></TouchableOpacity>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 10, paddingBottom: 8 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginVertical: 12 },
  headingText: { fontSize: 18, fontWeight: '700' },
  tabs: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  tab: { borderWidth: 1, borderColor: '#8B5267', borderRadius: 18, paddingHorizontal: 13, paddingVertical: 8, backgroundColor: '#3A1022' },
  activeTab: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
  tabText: { color: '#F5DCE5', fontSize: 12 }, activeTabText: { color: '#580024', fontWeight: '700' },
  card: { marginHorizontal: 16, marginBottom: 14, borderRadius: 18, overflow: 'hidden', backgroundColor: '#FFFDF9', flexDirection: 'row', minHeight: 146, elevation: 3 },
  image: { width: 112, backgroundColor: '#E9D8C4' }, imageShade: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 112, backgroundColor: 'rgba(74,14,23,0.18)' }, cardBody: { flex: 1, padding: 13 }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  store: { color: '#8A6420', fontSize: 11, fontWeight: '800' }, title: { color: '#36050C', fontSize: 14, fontWeight: '800', marginTop: 5, textAlign: 'right' },
  badges: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 7, marginTop: 8 }, verified: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#D4AF37', borderRadius: 12, paddingHorizontal: 7, paddingVertical: 4 }, verifiedText: { color: '#FFF8D6', fontSize: 10, fontWeight: '800' }, expiry: { color: '#80666B', fontSize: 10 }, expired: { color: '#999' },
  actions: { alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFD700', borderRadius: 9, paddingHorizontal: 10, paddingVertical: 7 }, actionText: { color: '#4A0E17', fontSize: 11, fontWeight: '800' },
  codeButton: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#D4AF37', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6 }, codeText: { color: '#8A6420', fontSize: 11, fontWeight: '800' },
  toast: { position: 'absolute', top: 8, alignSelf: 'center', flexDirection: 'row', gap: 7, backgroundColor: '#FFFDF9', borderWidth: 1, borderColor: '#D4AF37', paddingHorizontal: 14, paddingVertical: 11, borderRadius: 20, elevation: 5 },
});