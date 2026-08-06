import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { DEFAULT_DEALS_DATA, useApp, type DealCategory } from '@/context/AppContext';

const tabs: { key: DealCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'الكل' }, { key: 'supermarkets', label: 'سوبرماركت' },
  { key: 'coupons', label: 'كوبونات' }, { key: 'travel', label: 'طيران وفنادق' },
  { key: 'official_prices', label: 'أسعار رسمية' },
];

function remaining(expiry: string) {
  const ms = new Date(expiry).getTime() - Date.now();
  if (ms <= 0) return 'انتهى العرض';
  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(hours / 24);
  return days ? `متبقي ${days} يوم` : `متبقي ${hours} ساعة`;
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
        const expired = remaining(deal.expiryDate) === 'انتهى العرض';
        return <View key={deal.id} style={styles.card}>
          <Image source={{ uri: deal.image }} style={styles.image} resizeMode="cover" defaultSource={require('@/assets/images/icon.png')} />
          <View style={styles.cardBody}>
            <View style={styles.row}><Text style={styles.store}>{deal.storeName}</Text><TouchableOpacity onPress={() => void toggleSavedDeal(deal.id)}><Ionicons name={savedDeals.includes(deal.id) ? 'heart' : 'heart-outline'} size={22} color={savedDeals.includes(deal.id) ? '#E63946' : colors.gold} /></TouchableOpacity></View>
            <Text style={styles.title}>{deal.title}</Text>
            <View style={styles.badges}>
              {deal.isVerifiedGov && <Text style={styles.verified}><Ionicons name="checkmark-circle" size={12} color="#FFD700" /> مُعتمد رسمياً</Text>}
              <Text style={[styles.expiry, expired && styles.expired]}>{remaining(deal.expiryDate)}</Text>
            </View>
            <View style={styles.actions}>
              {deal.code && <TouchableOpacity style={styles.codeButton} onPress={() => { void Clipboard.setStringAsync(deal.code!); setToast(true); setTimeout(() => setToast(false), 2200); }}><Ionicons name="copy-outline" size={14} color="#FFD700" /><Text style={styles.codeText}>{deal.code}</Text></TouchableOpacity>}
              <TouchableOpacity style={styles.action} onPress={() => void Linking.openURL(deal.dealUrl)}><Text style={styles.actionText}>{deal.category === 'travel' ? 'احجز الآن' : 'مشاهدة العرض'}</Text><Ionicons name="arrow-back" size={16} color="#580024" /></TouchableOpacity>
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
  card: { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, overflow: 'hidden', backgroundColor: '#580024', flexDirection: 'row', minHeight: 132 },
  image: { width: 104, backgroundColor: '#7D2045' }, cardBody: { flex: 1, padding: 12 }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  store: { color: '#FFD700', fontSize: 11, fontWeight: '700' }, title: { color: '#FFF', fontSize: 14, fontWeight: '700', marginTop: 5, textAlign: 'right' },
  badges: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 7, marginTop: 8 }, verified: { color: '#FFE79A', fontSize: 10 }, expiry: { color: '#F5DCE5', fontSize: 10 }, expired: { color: '#AAA' },
  actions: { alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFD700', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 }, actionText: { color: '#580024', fontSize: 11, fontWeight: '700' },
  codeButton: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#FFD700', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6 }, codeText: { color: '#FFD700', fontSize: 11, fontWeight: '700' },
  toast: { position: 'absolute', bottom: 10, alignSelf: 'center', flexDirection: 'row', gap: 7, backgroundColor: '#FFD700', padding: 12, borderRadius: 20 },
});