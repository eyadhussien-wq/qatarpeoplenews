import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import {
  useApp,
  type AdBanner,
  type AffiliateProduct,
  type CarouselItem,
  type Channel,
} from '@/context/AppContext';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin2026';
type Section = 'carousel' | 'channels' | 'ads' | 'affiliates';

const TABS: { id: Section; label: string }[] = [
  { id: 'carousel', label: 'الكاروسيل' },
  { id: 'channels', label: 'القنوات' },
  { id: 'ads', label: 'الإعلانات' },
  { id: 'affiliates', label: 'الأفيلييت' },
];

// ── shared field input ──────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  ltr = false,
  placeholder = '',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  ltr?: boolean;
  placeholder?: string;
}) {
  const colors = useColors();
  return (
    <View style={fieldStyles.wrap}>
      <Text style={[fieldStyles.label, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
        {label}
      </Text>
      <TextInput
        style={[
          fieldStyles.input,
          {
            borderColor: colors.border,
            backgroundColor: colors.background,
            color: colors.foreground,
            fontFamily: 'Inter_400Regular',
          },
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        textAlign={ltr ? 'left' : 'right'}
        autoCapitalize={ltr ? 'none' : 'sentences'}
        keyboardType={ltr ? 'url' : 'default'}
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { gap: 4, marginBottom: 6 },
  label: { fontSize: 12, textAlign: 'right' },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
});

// ── Carousel section ────────────────────────────────────────────────────────
function CarouselSection() {
  const colors = useColors();
  const { carousel, updateCarousel } = useApp();
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<CarouselItem>>({});

  const save = async () => {
    if (!editId) return;
    await updateCarousel(carousel.map(c => (c.id === editId ? { ...c, ...draft } : c)));
    setEditId(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={s.section}>
      {carousel.map(item => (
        <View key={item.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {editId === item.id ? (
            <>
              <Field label="العنوان" value={draft.title ?? ''} onChange={v => setDraft(d => ({ ...d, title: v }))} />
              <Field label="النص الفرعي" value={draft.subtitle ?? ''} onChange={v => setDraft(d => ({ ...d, subtitle: v }))} />
              <Field label="رابط الإجراء" value={draft.actionUrl ?? ''} onChange={v => setDraft(d => ({ ...d, actionUrl: v }))} ltr />
              <View style={s.rowBtns}>
                <TouchableOpacity style={[s.btn, { backgroundColor: colors.muted }]} onPress={() => setEditId(null)}>
                  <Text style={[s.btnTxt, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.btn, { backgroundColor: colors.primary }]} onPress={save}>
                  <Text style={[s.btnTxt, { color: '#FFF', fontFamily: 'Inter_600SemiBold' }]}>حفظ</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={s.row}>
              <View style={[s.colorDot, { backgroundColor: item.bgColor }]} />
              <View style={s.info}>
                <Text style={[s.cardTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={[s.cardSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]} numberOfLines={1}>
                  {item.actionUrl}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => { setEditId(item.id); setDraft({ ...item }); }}
                style={[s.iconBtn, { backgroundColor: colors.secondary }]}
              >
                <Ionicons name="pencil" size={15} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

// ── Channels section ────────────────────────────────────────────────────────
function ChannelsSection() {
  const colors = useColors();
  const { channels, updateChannels } = useApp();
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Channel>>({});

  const save = async () => {
    if (!editId) return;
    await updateChannels(channels.map(c => (c.id === editId ? { ...c, ...draft } : c)));
    setEditId(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={s.section}>
      {channels.map(ch => (
        <View key={ch.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {editId === ch.id ? (
            <>
              <Field label="اسم القناة" value={draft.name ?? ''} onChange={v => setDraft(d => ({ ...d, name: v }))} />
              <Field label="رابط YouTube" value={draft.url ?? ''} onChange={v => setDraft(d => ({ ...d, url: v }))} ltr />
              <View style={s.rowBtns}>
                <TouchableOpacity style={[s.btn, { backgroundColor: colors.muted }]} onPress={() => setEditId(null)}>
                  <Text style={[s.btnTxt, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.btn, { backgroundColor: colors.primary }]} onPress={save}>
                  <Text style={[s.btnTxt, { color: '#FFF', fontFamily: 'Inter_600SemiBold' }]}>حفظ</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={s.row}>
              <View style={[s.colorDot, { backgroundColor: ch.color }]} />
              <View style={s.info}>
                <Text style={[s.cardTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{ch.name}</Text>
                <Text style={[s.cardSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]} numberOfLines={1}>
                  {ch.url}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => { setEditId(ch.id); setDraft({ ...ch }); }}
                style={[s.iconBtn, { backgroundColor: colors.secondary }]}
              >
                <Ionicons name="pencil" size={15} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

// ── Ads section ─────────────────────────────────────────────────────────────
function AdsSection() {
  const colors = useColors();
  const { ads, updateAds } = useApp();
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<AdBanner>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newAd, setNewAd] = useState<Partial<AdBanner>>({ type: 'premium', bgColor: '#1A4B38', textColor: '#FFFFFF', expiresAt: '2026-12-31' });

  const save = async () => {
    if (!editId) return;
    await updateAds(ads.map(a => (a.id === editId ? { ...a, ...draft } : a)));
    setEditId(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const confirmDelete = (id: string) => {
    const doDelete = () => updateAds(ads.filter(a => a.id !== id));
    if (Platform.OS === 'web') {
      if ((window as Window & typeof globalThis & { confirm: (msg: string) => boolean }).confirm('حذف الإعلان؟')) doDelete();
    } else {
      Alert.alert('حذف الإعلان', 'هل أنت متأكد؟', [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'حذف', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const addAd = async () => {
    if (!newAd.title || !newAd.linkUrl) return;
    const ad: AdBanner = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
      title: newAd.title ?? '',
      subtitle: newAd.subtitle ?? '',
      bgColor: newAd.bgColor ?? '#1A4B38',
      textColor: newAd.textColor ?? '#FFFFFF',
      linkUrl: newAd.linkUrl ?? '',
      type: newAd.type ?? 'premium',
      expiresAt: newAd.expiresAt ?? null,
    };
    await updateAds([...ads, ad]);
    setNewAd({ type: 'premium', bgColor: '#1A4B38', textColor: '#FFFFFF', expiresAt: '2026-12-31' });
    setShowAdd(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={s.section}>
      <TouchableOpacity
        style={[s.addBtn, { backgroundColor: colors.primary }]}
        onPress={() => setShowAdd(v => !v)}
      >
        <Ionicons name={showAdd ? 'close' : 'add'} size={18} color="#FFF" />
        <Text style={[s.addBtnTxt, { fontFamily: 'Inter_600SemiBold' }]}>
          {showAdd ? 'إلغاء' : 'إضافة إعلان'}
        </Text>
      </TouchableOpacity>

      {showAdd && (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.gold }]}>
          <Field label="العنوان *" value={newAd.title ?? ''} onChange={v => setNewAd(d => ({ ...d, title: v }))} />
          <Field label="النص الفرعي" value={newAd.subtitle ?? ''} onChange={v => setNewAd(d => ({ ...d, subtitle: v }))} />
          <Field label="الرابط *" value={newAd.linkUrl ?? ''} onChange={v => setNewAd(d => ({ ...d, linkUrl: v }))} ltr />
          <Field label="تاريخ الانتهاء (YYYY-MM-DD)" value={newAd.expiresAt ?? ''} onChange={v => setNewAd(d => ({ ...d, expiresAt: v || null }))} ltr placeholder="2026-12-31" />
          <View style={s.typeRow}>
            {(['premium', 'sticky'] as const).map(t => (
              <TouchableOpacity
                key={t}
                style={[s.typeChip, { borderColor: colors.border, backgroundColor: newAd.type === t ? colors.primary : colors.background }]}
                onPress={() => setNewAd(d => ({ ...d, type: t }))}
              >
                <Text style={[s.typeChipTxt, { color: newAd.type === t ? '#FFF' : colors.foreground, fontFamily: 'Inter_500Medium' }]}>
                  {t === 'premium' ? 'بريميوم' : 'سفلي ثابت'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={[s.btn, { backgroundColor: colors.primary, width: '100%', marginTop: 4 }]} onPress={addAd}>
            <Text style={[s.btnTxt, { color: '#FFF', fontFamily: 'Inter_600SemiBold' }]}>إضافة</Text>
          </TouchableOpacity>
        </View>
      )}

      {ads.map(ad => (
        <View key={ad.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {editId === ad.id ? (
            <>
              <Field label="العنوان" value={draft.title ?? ''} onChange={v => setDraft(d => ({ ...d, title: v }))} />
              <Field label="الرابط" value={draft.linkUrl ?? ''} onChange={v => setDraft(d => ({ ...d, linkUrl: v }))} ltr />
              <Field label="تاريخ الانتهاء" value={draft.expiresAt ?? ''} onChange={v => setDraft(d => ({ ...d, expiresAt: v || null }))} ltr />
              <View style={s.rowBtns}>
                <TouchableOpacity style={[s.btn, { backgroundColor: colors.muted }]} onPress={() => setEditId(null)}>
                  <Text style={[s.btnTxt, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.btn, { backgroundColor: colors.primary }]} onPress={save}>
                  <Text style={[s.btnTxt, { color: '#FFF', fontFamily: 'Inter_600SemiBold' }]}>حفظ</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={s.row}>
              <View style={s.rowActions}>
                <TouchableOpacity onPress={() => { setEditId(ad.id); setDraft({ ...ad }); }} style={[s.iconBtn, { backgroundColor: colors.secondary }]}>
                  <Ionicons name="pencil" size={15} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDelete(ad.id)} style={[s.iconBtn, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="trash" size={15} color={colors.destructive} />
                </TouchableOpacity>
              </View>
              <View style={s.info}>
                <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                  <View style={[s.colorDot, { backgroundColor: ad.bgColor }]} />
                  <View style={[s.typePill, { backgroundColor: ad.type === 'sticky' ? colors.accent : colors.primary }]}>
                    <Text style={[s.typePillTxt, { fontFamily: 'Inter_600SemiBold' }]}>
                      {ad.type === 'sticky' ? 'سفلي' : 'بريميوم'}
                    </Text>
                  </View>
                </View>
                <Text style={[s.cardTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]} numberOfLines={1}>
                  {ad.title}
                </Text>
                {ad.expiresAt && (
                  <Text style={[s.cardSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                    ينتهي: {ad.expiresAt}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

// ── Affiliates section ───────────────────────────────────────────────────────
function AffiliatesSection() {
  const colors = useColors();
  const { affiliates, updateAffiliates } = useApp();
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<AffiliateProduct>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newP, setNewP] = useState<Partial<AffiliateProduct>>({ platform: 'temu' });

  const save = async () => {
    if (!editId) return;
    await updateAffiliates(affiliates.map(a => (a.id === editId ? { ...a, ...draft } : a)));
    setEditId(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const confirmDelete = (id: string) => {
    const del = () => updateAffiliates(affiliates.filter(a => a.id !== id));
    if (Platform.OS === 'web') {
      if ((window as Window & typeof globalThis & { confirm: (msg: string) => boolean }).confirm('حذف المنتج؟')) del();
    } else {
      Alert.alert('حذف', 'هل أنت متأكد؟', [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'حذف', style: 'destructive', onPress: del },
      ]);
    }
  };

  const addP = async () => {
    if (!newP.name || !newP.buyUrl) return;
    const p: AffiliateProduct = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
      name: newP.name ?? '',
      price: newP.price ?? '',
      buyUrl: newP.buyUrl ?? '',
      platform: newP.platform ?? 'temu',
    };
    await updateAffiliates([...affiliates, p]);
    setNewP({ platform: 'temu' });
    setShowAdd(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={s.section}>
      <TouchableOpacity style={[s.addBtn, { backgroundColor: colors.primary }]} onPress={() => setShowAdd(v => !v)}>
        <Ionicons name={showAdd ? 'close' : 'add'} size={18} color="#FFF" />
        <Text style={[s.addBtnTxt, { fontFamily: 'Inter_600SemiBold' }]}>
          {showAdd ? 'إلغاء' : 'إضافة منتج'}
        </Text>
      </TouchableOpacity>

      {showAdd && (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.gold }]}>
          <Field label="اسم المنتج *" value={newP.name ?? ''} onChange={v => setNewP(d => ({ ...d, name: v }))} />
          <Field label="السعر" value={newP.price ?? ''} onChange={v => setNewP(d => ({ ...d, price: v }))} />
          <Field label="رابط الشراء *" value={newP.buyUrl ?? ''} onChange={v => setNewP(d => ({ ...d, buyUrl: v }))} ltr />
          <View style={s.typeRow}>
            {(['temu', 'amazon'] as const).map(p => (
              <TouchableOpacity
                key={p}
                style={[s.typeChip, { borderColor: colors.border, backgroundColor: newP.platform === p ? (p === 'temu' ? '#FF6000' : '#FF9900') : colors.background }]}
                onPress={() => setNewP(d => ({ ...d, platform: p }))}
              >
                <Text style={[s.typeChipTxt, { color: newP.platform === p ? '#FFF' : colors.foreground, fontFamily: 'Inter_500Medium' }]}>
                  {p === 'temu' ? 'TEMU' : 'Amazon'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={[s.btn, { backgroundColor: colors.primary, width: '100%', marginTop: 4 }]} onPress={addP}>
            <Text style={[s.btnTxt, { color: '#FFF', fontFamily: 'Inter_600SemiBold' }]}>إضافة</Text>
          </TouchableOpacity>
        </View>
      )}

      {affiliates.map(p => (
        <View key={p.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {editId === p.id ? (
            <>
              <Field label="اسم المنتج" value={draft.name ?? ''} onChange={v => setDraft(d => ({ ...d, name: v }))} />
              <Field label="السعر" value={draft.price ?? ''} onChange={v => setDraft(d => ({ ...d, price: v }))} />
              <Field label="رابط الشراء" value={draft.buyUrl ?? ''} onChange={v => setDraft(d => ({ ...d, buyUrl: v }))} ltr />
              <View style={s.rowBtns}>
                <TouchableOpacity style={[s.btn, { backgroundColor: colors.muted }]} onPress={() => setEditId(null)}>
                  <Text style={[s.btnTxt, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.btn, { backgroundColor: colors.primary }]} onPress={save}>
                  <Text style={[s.btnTxt, { color: '#FFF', fontFamily: 'Inter_600SemiBold' }]}>حفظ</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={s.row}>
              <View style={s.rowActions}>
                <TouchableOpacity onPress={() => { setEditId(p.id); setDraft({ ...p }); }} style={[s.iconBtn, { backgroundColor: colors.secondary }]}>
                  <Ionicons name="pencil" size={15} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDelete(p.id)} style={[s.iconBtn, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="trash" size={15} color={colors.destructive} />
                </TouchableOpacity>
              </View>
              <View style={s.info}>
                <Text style={[s.cardTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{p.name}</Text>
                <Text style={[s.cardSub, { color: p.platform === 'temu' ? '#FF6000' : '#FF9900', fontFamily: 'Inter_600SemiBold' }]}>
                  {p.price} · {p.platform === 'temu' ? 'TEMU' : 'Amazon'}
                </Text>
              </View>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;
  const [active, setActive] = useState<Section>('carousel');

  const renderSection = () => {
    switch (active) {
      case 'carousel': return <CarouselSection />;
      case 'channels': return <ChannelsSection />;
      case 'ads': return <AdsSection />;
      case 'affiliates': return <AffiliatesSection />;
    }
  };

  return (
    <View style={[dash.container, { backgroundColor: colors.background }]}>
      {/* Header bar */}
      <View style={[dash.header, { backgroundColor: colors.primary, paddingTop: topPad + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={dash.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={[dash.title, { color: colors.gold, fontFamily: 'Inter_700Bold' }]}>لوحة التحكم</Text>
        <TouchableOpacity onPress={onLogout} style={dash.iconBtn}>
          <Ionicons name="log-out-outline" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Section tabs */}
      <View style={[dash.tabs, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[dash.tab, active === tab.id && { borderBottomColor: colors.primary }]}
            onPress={() => setActive(tab.id)}
          >
            <Text style={[dash.tabTxt, {
              color: active === tab.id ? colors.primary : colors.mutedForeground,
              fontFamily: active === tab.id ? 'Inter_600SemiBold' : 'Inter_400Regular',
            }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        {renderSection()}
      </ScrollView>
    </View>
  );
}

const dash = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  title: { fontSize: 18 },
  iconBtn: { padding: 6 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabTxt: { fontSize: 12 },
});

// ── Login screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;
  const [username, setUsername] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');

  const doLogin = () => {
    if (username.trim().toLowerCase() === ADMIN_USERNAME && pw === ADMIN_PASSWORD) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onLogin();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      setUsername('');
      setPw('');
    }
  };

  return (
    <View style={[login.container, { backgroundColor: colors.background, paddingTop: topPad + 16 }]}>
      <TouchableOpacity style={login.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={colors.primary} />
        <Text style={[login.backTxt, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>رجوع</Text>
      </TouchableOpacity>

      <View style={login.card}>
        <View style={[login.iconCircle, { backgroundColor: colors.primary }]}>
          <Ionicons name="lock-closed" size={32} color={colors.gold} />
        </View>
        <Text style={[login.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>لوحة التحكم</Text>
        <Text style={[login.sub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
           أدخل اسم المستخدم وكلمة المرور للدخول
        </Text>
        <TextInput
          style={[
            login.input,
            { borderColor: error ? colors.destructive : colors.border, backgroundColor: colors.card, color: colors.foreground, fontFamily: 'Inter_400Regular' },
          ]}
          placeholder="اسم المستخدم"
          placeholderTextColor={colors.mutedForeground}
          value={username}
          onChangeText={v => { setUsername(v); setError(''); }}
          autoCapitalize="none"
          textAlign="right"
        />
        <TextInput
          style={[
            login.input,
            { borderColor: error ? colors.destructive : colors.border, backgroundColor: colors.card, color: colors.foreground, fontFamily: 'Inter_400Regular' },
          ]}
          placeholder="كلمة المرور"
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry
          value={pw}
          onChangeText={v => { setPw(v); setError(''); }}
          onSubmitEditing={doLogin}
          textAlign="right"
        />
        {error ? (
          <Text style={[login.error, { color: colors.destructive, fontFamily: 'Inter_400Regular' }]}>{error}</Text>
        ) : null}
        <TouchableOpacity style={[login.loginBtn, { backgroundColor: colors.primary }]} onPress={doLogin} activeOpacity={0.85}>
          <Text style={[login.loginBtnTxt, { fontFamily: 'Inter_700Bold' }]}>دخول</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const login = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 40 },
  backTxt: { fontSize: 16 },
  card: { alignItems: 'center', gap: 12 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  title: { fontSize: 24 },
  sub: { fontSize: 14, marginBottom: 8 },
  input: { width: '100%', borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  error: { fontSize: 13 },
  loginBtn: { width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  loginBtnTxt: { color: '#FFF', fontSize: 16 },
});

// ── shared styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  section: { padding: 16, gap: 10 },
  card: { borderWidth: 1, borderRadius: 12, padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowActions: { flexDirection: 'column', gap: 6 },
  rowBtns: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end', marginTop: 4 },
  btn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 8, alignItems: 'center', minWidth: 80 },
  btnTxt: { fontSize: 13 },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  info: { flex: 1, alignItems: 'flex-end', gap: 3 },
  cardTitle: { fontSize: 14, textAlign: 'right' },
  cardSub: { fontSize: 11, textAlign: 'right' },
  iconBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 10 },
  addBtnTxt: { color: '#FFF', fontSize: 14 },
  typeRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  typeChip: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
  typeChipTxt: { fontSize: 12 },
  typePill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  typePillTxt: { color: '#FFF', fontSize: 9 },
});

// ── Root export ──────────────────────────────────────────────────────────────
export default function AdminScreen() {
  const [loggedIn, setLoggedIn] = useState(false);
  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;
  return <Dashboard onLogout={() => setLoggedIn(false)} />;
}
