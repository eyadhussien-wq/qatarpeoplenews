import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ---- Types ----
export interface Channel {
  id: string;
  name: string;
  url: string;
  color: string;
}

export interface CarouselItem {
  id: string;
  title: string;
  subtitle: string;
  actionUrl: string;
  bgColor: string;
  imagePath?: string;
}

export interface AdBanner {
  id: string;
  title: string;
  subtitle: string;
  bgColor: string;
  textColor: string;
  linkUrl: string;
  type: 'premium' | 'sticky';
  expiresAt: string | null;
}

export interface AffiliateProduct {
  id: string;
  name: string;
  price: string;
  buyUrl: string;
  platform: 'temu' | 'amazon';
}

export interface RadioStation {
  id: string;
  name: string;
  key: 'qur' | 'skfm' | 'qr' | 'alrayyanfm';
  streamUrl: string;
  webAudioUrl: string;
  color: string;
}

export type DealCategory = 'supermarkets' | 'coupons' | 'travel' | 'official_prices';

export interface Deal {
  id: string;
  title: string;
  storeName: string;
  category: DealCategory;
  expiryDate: string;
  code?: string;
  dealUrl: string;
  image: string;
  isVerifiedGov: boolean;
  isOfficialDiscount: boolean;
}

interface AppContextType {
  channels: Channel[];
  carousel: CarouselItem[];
  ads: AdBanner[];
  affiliates: AffiliateProduct[];
  radioStations: RadioStation[];
  savedDeals: string[];
  isDrawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  updateChannels: (data: Channel[]) => Promise<void>;
  updateCarousel: (data: CarouselItem[]) => Promise<void>;
  updateAds: (data: AdBanner[]) => Promise<void>;
  updateAffiliates: (data: AffiliateProduct[]) => Promise<void>;
  toggleSavedDeal: (dealId: string) => Promise<void>;
}

// ---- Default data ----
const DEFAULT_CHANNELS: Channel[] = [
  { id: '1', name: 'قناة الجزيرة الإخبارية', url: 'https://www.youtube.com/embed/bNyUyrR0PHo?autoplay=1&enablejsapi=1', color: '#1A1A2E' },
  { id: '2', name: 'تلفزيون قطر', url: 'https://www.youtube.com/embed/d020NL_oFAY?autoplay=1&enablejsapi=1', color: '#1A4B38' },
  { id: '3', name: 'قناة قطر للقرآن الكريم', url: 'https://www.youtube.com/embed/r2LbAGVxNRg?autoplay=1&enablejsapi=1', color: '#6B1A1A' },
  { id: '4', name: 'التلفزيون العربي', url: 'https://www.youtube.com/embed/e2RgSa1Wt5o?autoplay=1&enablejsapi=1', color: '#1A3A6B' },
];

const DEFAULT_CAROUSEL: CarouselItem[] = [
  {
    id: '1',
    title: 'الآن: بث مباشر مباراة السد والريان',
    subtitle: 'اضغط للمشاهدة',
    actionUrl: 'https://www.youtube.com/embed/bNyUyrR0PHo?autoplay=1&enablejsapi=1',
    bgColor: '#0F2D22',
    imagePath: 'hero-stadium',
  },
  {
    id: '2',
    title: 'عاجل: تصريح هام من وزارة الداخلية',
    subtitle: 'اقرأ التفاصيل',
    actionUrl: 'https://www.moi.gov.qa',
    bgColor: '#5A1010',
    imagePath: 'hero-doha',
  },
  {
    id: '3',
    title: 'تغطية خاصة: فعاليات سوق واقف في عيد الأضحى',
    subtitle: 'شاهد التغطية الكاملة',
    actionUrl: 'https://www.youtube.com/embed/d020NL_oFAY?autoplay=1&enablejsapi=1',
    bgColor: '#2A4A1A',
    imagePath: 'hero-stadium',
  },
];

const DEFAULT_ADS: AdBanner[] = [
  {
    id: '1',
    title: 'عرض التوفير من أريد',
    subtitle: 'وفّر على آلاف المنتجات يومياً',
    bgColor: '#E63946',
    textColor: '#FFFFFF',
    linkUrl: 'https://aridh.qa',
    type: 'premium',
    expiresAt: '2026-12-31',
  },
  {
    id: '2',
    title: 'بنك قطر الوطني',
    subtitle: 'افتح حسابك الآن واستمتع بالمزايا',
    bgColor: '#1A4B38',
    textColor: '#FFFFFF',
    linkUrl: 'https://www.qnb.com',
    type: 'sticky',
    expiresAt: '2026-12-31',
  },
];

const DEFAULT_AFFILIATES: AffiliateProduct[] = [
  { id: '1', name: 'ساعة ذكية برو', price: '99 ريال', buyUrl: 'https://temu.com', platform: 'temu' },
  { id: '2', name: 'سماعات لاسلكية', price: '149 ريال', buyUrl: 'https://amazon.sa', platform: 'amazon' },
  { id: '3', name: 'حقيبة سفر', price: '59 ريال', buyUrl: 'https://temu.com', platform: 'temu' },
  { id: '4', name: 'كيبورد ميكانيكي', price: '199 ريال', buyUrl: 'https://amazon.sa', platform: 'amazon' },
];

export const STATIONS_VERSION = 'v25_native_hls_web_audio';
export const DEFAULT_RADIO: RadioStation[] = [
  { id: 'quran-qatar', name: 'إذاعة القرآن الكريم', key: 'qur', streamUrl: 'https://qmcconnect.qa/api/StreamServices/qur/master.m3u8', webAudioUrl: 'https://stream.radiojar.com/quran_qatar', color: '#1A4B38' },
  { id: 'sout-al-khaleej', name: 'صوت الخليج', key: 'skfm', streamUrl: 'https://qmcconnect.qa/api/StreamServices/skr/master.m3u8', webAudioUrl: 'https://skfm.out.airtime.pro/skfm_a', color: '#6B1A4B' },
  { id: 'qatar-radio', name: 'إذاعة قطر - البرنامج العام', key: 'qr', streamUrl: 'https://qmcconnect.qa/api/StreamServices/qr/master.m3u8', webAudioUrl: 'https://stream.radiojar.com/qatar_radio', color: '#1A3A6B' },
  { id: 'rayyan', name: 'راديو الريان', key: 'alrayyanfm', streamUrl: 'https://qmcconnect.qa/api/StreamServices/alrayyanfm/master.m3u8', webAudioUrl: 'https://stream.zeno.fm/alrayyan', color: '#8A1538' },
];

export const DEALS_VERSION = 'v2_official_deals_hub';
export const DEFAULT_DEALS_DATA: Deal[] = [
  { id: 'moci-produce-index', title: 'مؤشر أسعار الخضروات والفواكه اليومي', storeName: 'وزارة التجارة والصناعة قطر', category: 'official_prices', expiryDate: '2027-12-31T23:59:59+03:00', dealUrl: 'https://www.moci.gov.qa', image: 'https://www.moci.gov.qa/wp-content/uploads/2021/11/logo.png', isVerifiedGov: true, isOfficialDiscount: false },
  { id: 'visit-qatar-staycation', title: 'عروض الإقامة والأنشطة في قطر', storeName: 'زوروا قطر', category: 'travel', expiryDate: '2027-12-31T23:59:59+03:00', dealUrl: 'https://visitqatar.com/intl-en/plan-your-trip/accommodation', image: 'https://visitqatar.com/content/dam/visitqatar/img/brand/visit-qatar-logo.svg', isVerifiedGov: true, isOfficialDiscount: true },
  { id: 'qatar-airways-stopover', title: 'باقة التوقف في الدوحة', storeName: 'عطلات الخطوط الجوية القطرية', category: 'travel', expiryDate: '2027-12-31T23:59:59+03:00', dealUrl: 'https://www.qatarairways.com/en-qa/offers/stopover.html', image: 'https://www.qatarairways.com/content/dam/images/renditions/vertical-1/qatar-airways/logo/qatar-airways-logo.png', isVerifiedGov: false, isOfficialDiscount: true },
  { id: 'al-meera-weekly', title: 'العروض الأسبوعية', storeName: 'الميرة', category: 'supermarkets', expiryDate: '2027-12-31T23:59:59+03:00', dealUrl: 'https://www.almeera.com.qa', image: 'https://www.almeera.com.qa/Images/logo.png', isVerifiedGov: false, isOfficialDiscount: false },
  { id: 'lulu-qatar-weekly', title: 'النشرة الأسبوعية والعروض', storeName: 'لولو هايبرماركت قطر', category: 'supermarkets', expiryDate: '2027-12-31T23:59:59+03:00', dealUrl: 'https://www.luluhypermarket.com/en-qa', image: 'https://www.luluhypermarket.com/_ui/responsive/common/images/lulu-logo.svg', isVerifiedGov: false, isOfficialDiscount: false },
  { id: 'carrefour-qatar-weekly', title: 'عروض كارفور الأسبوعية', storeName: 'كارفور قطر', category: 'supermarkets', expiryDate: '2027-12-31T23:59:59+03:00', dealUrl: 'https://www.carrefourqatar.com', image: 'https://www.carrefourqatar.com/_ui/responsive/theme-lambda/images/carrefour-logo.svg', isVerifiedGov: false, isOfficialDiscount: false },
];

const KEYS = {
  CHANNELS: '@ahl_qatar_channels_v1',
  CAROUSEL: '@ahl_qatar_carousel_v1',
  ADS: '@ahl_qatar_ads_v1',
  AFFILIATES: '@ahl_qatar_affiliates_v1',
  RADIO_LEGACY: '@ahl_qatar_radio_v1',
  RADIO_LEGACY_ALT: '@ahl_qatar_radio',
  RADIO_STATIONS: 'radio_stations',
  RADIO_STATIONS_VERSION: 'STATIONS_VERSION',
  RADIO_ENDPOINTS_VERSION: '@ahl_qatar_radio_endpoints_v2',
  DEALS: '@ahl_qatar_deals_v2',
  SAVED_DEALS: '@ahl_qatar_saved_deals_v2',
} as const;

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [channels, setChannels] = useState<Channel[]>(DEFAULT_CHANNELS);
  const [carousel, setCarousel] = useState<CarouselItem[]>(DEFAULT_CAROUSEL);
  const [ads, setAds] = useState<AdBanner[]>(DEFAULT_ADS);
  const [affiliates, setAffiliates] = useState<AffiliateProduct[]>(DEFAULT_AFFILIATES);
  const [savedDeals, setSavedDeals] = useState<string[]>([]);
  const [isDrawerOpen, setDrawerOpenState] = useState(false);

  useEffect(() => {
    // Radio stations are shipped defaults, not user-editable data. Remove
    // legacy persisted copies so old failed URLs cannot be reused by clients.
    void (async () => {
      const savedStationVersion = await AsyncStorage.getItem(KEYS.RADIO_STATIONS_VERSION);
      if (savedStationVersion !== STATIONS_VERSION) {
        await AsyncStorage.multiSet([
          [KEYS.RADIO_STATIONS, JSON.stringify(DEFAULT_RADIO)],
          [KEYS.RADIO_STATIONS_VERSION, STATIONS_VERSION],
          [KEYS.RADIO_ENDPOINTS_VERSION, STATIONS_VERSION],
        ]);
        await AsyncStorage.multiRemove([
          KEYS.RADIO_LEGACY,
          KEYS.RADIO_LEGACY_ALT,
        ]);
      }
    })().catch(() => {});
    AsyncStorage.multiGet([KEYS.CHANNELS, KEYS.CAROUSEL, KEYS.ADS, KEYS.AFFILIATES, KEYS.SAVED_DEALS])
      .then(pairs => {
        for (const [key, value] of pairs) {
          if (!value) continue;
          try {
            const parsed = JSON.parse(value);
            if (key === KEYS.CHANNELS) {
              const migrated = (parsed as Channel[]).map(channel => {
                const fresh = DEFAULT_CHANNELS.find(item => item.id === channel.id);
                // Upgrade the shipped legacy channel links while preserving
                // any channel edits made from the admin dashboard.
                const isLegacy = !channel.url.includes('/embed/');
                return fresh && isLegacy ? { ...fresh } : channel;
              });
              setChannels(migrated);
              if (JSON.stringify(migrated) !== JSON.stringify(parsed)) {
                AsyncStorage.setItem(KEYS.CHANNELS, JSON.stringify(migrated)).catch(() => {});
              }
            }
            else if (key === KEYS.CAROUSEL) setCarousel(parsed);
            else if (key === KEYS.ADS) setAds(parsed);
            else if (key === KEYS.AFFILIATES) setAffiliates(parsed);
            else if (key === KEYS.SAVED_DEALS && Array.isArray(parsed)) setSavedDeals(parsed);
          } catch { /* ignore */ }
        }
      })
      .catch(() => { /* ignore storage errors */ });
  }, []);

  const setDrawerOpen = useCallback((v: boolean) => setDrawerOpenState(v), []);

  const updateChannels = useCallback(async (data: Channel[]) => {
    setChannels(data);
    await AsyncStorage.setItem(KEYS.CHANNELS, JSON.stringify(data));
  }, []);

  const updateCarousel = useCallback(async (data: CarouselItem[]) => {
    setCarousel(data);
    await AsyncStorage.setItem(KEYS.CAROUSEL, JSON.stringify(data));
  }, []);

  const updateAds = useCallback(async (data: AdBanner[]) => {
    setAds(data);
    await AsyncStorage.setItem(KEYS.ADS, JSON.stringify(data));
  }, []);

  const updateAffiliates = useCallback(async (data: AffiliateProduct[]) => {
    setAffiliates(data);
    await AsyncStorage.setItem(KEYS.AFFILIATES, JSON.stringify(data));
  }, []);

  const toggleSavedDeal = useCallback(async (dealId: string) => {
    setSavedDeals(current => {
      const next = current.includes(dealId) ? current.filter(id => id !== dealId) : [...current, dealId];
      void AsyncStorage.setItem(KEYS.SAVED_DEALS, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      channels,
      carousel,
      ads,
      affiliates,
      radioStations: DEFAULT_RADIO,
      savedDeals,
      isDrawerOpen,
      setDrawerOpen,
      updateChannels,
      updateCarousel,
      updateAds,
      updateAffiliates,
      toggleSavedDeal,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
