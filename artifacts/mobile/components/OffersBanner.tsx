import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, Linking, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

export type OfferBannerItem = {
  id: string;
  company: string;
  title: string;
  subtitle?: string;
  logoUrl?: string;
  imageUrl: string;
  officialUrl: string;
  badge?: string;
};

const OFFERS: OfferBannerItem[] = [
  { id: 'ooredoo', company: 'Ooredoo', title: 'أحدث عروض Ooredoo', subtitle: 'اكتشف العرض الرسمي الآن', imageUrl: 'https://www.ooredoo.qa/web/wp-content/uploads/2024/02/ooredoo-logo.png', officialUrl: 'https://www.ooredoo.qa/web/ar/promotions/', badge: 'عرض رسمي' },
  { id: 'qatar-airways', company: 'Qatar Airways', title: 'اكتشف أحدث عروض السفر', subtitle: 'العروض الرسمية من الخطوط الجوية القطرية', imageUrl: 'https://www.qatarairways.com/content/dam/images/renditions/horizontal-1/qatar-airways-logo.png', officialUrl: 'https://www.qatarairways.com/en-qa/offers.html', badge: 'عرض رسمي' },
];

export default function OffersBanner() {
  const index = useRef(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (next: number) => {
    index.current = (next + OFFERS.length) % OFFERS.length;
    Animated.spring(translateX, { toValue: -index.current * width, useNativeDriver: true, tension: 70, friction: 12 }).start();
  };

  useEffect(() => {
    timer.current = setInterval(() => goTo(index.current + 1), 5000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  const pause = () => { if (timer.current) clearInterval(timer.current); };
  const resume = () => { timer.current = setInterval(() => goTo(index.current + 1), 5000); };
  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12,
    onPanResponderGrant: pause,
    onPanResponderRelease: (_, g) => { if (Math.abs(g.dx) > 50) goTo(index.current + (g.dx < 0 ? 1 : -1)); resume(); },
    onPanResponderTerminate: resume,
  })).current;

  return (
    <View style={styles.wrap} {...panResponder.panHandlers}>
      <Text style={styles.heading}>عروض اليوم</Text>
      <View style={styles.viewport}>
        <Animated.View style={[styles.track, { width: width * OFFERS.length, transform: [{ translateX }] }]}>
          {OFFERS.map((offer) => (
            <Pressable key={offer.id} style={styles.card} onPress={() => Linking.openURL(offer.officialUrl)}>
              <Image source={{ uri: offer.imageUrl }} style={styles.image} resizeMode="cover" />
              <View style={styles.overlay}>
                <View style={styles.badge}><Text style={styles.badgeText}>{offer.badge ?? 'عرض رسمي'}</Text></View>
                <Text style={styles.company}>{offer.company}</Text>
                <Text style={styles.title}>{offer.title}</Text>
                {offer.subtitle ? <Text style={styles.subtitle}>{offer.subtitle}</Text> : null}
                <Text style={styles.cta}>شاهد العرض ←</Text>
              </View>
            </Pressable>
          ))}
        </Animated.View>
      </View>
      <View style={styles.dots}>{OFFERS.map((offer, i) => <View key={offer.id} style={[styles.dot, i === index.current && styles.activeDot]} />)}</View>
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { marginBottom: 18 }, heading: { fontSize: 20, fontWeight: '800', textAlign: 'right', marginHorizontal: 16, marginBottom: 10 }, viewport: { width, overflow: 'hidden' }, track: { flexDirection: 'row' }, card: { width: width - 24, height: 180, marginHorizontal: 12, borderRadius: 18, overflow: 'hidden', backgroundColor: '#111' }, image: { ...StyleSheet.absoluteFillObject, width: undefined, height: undefined }, overlay: { flex: 1, padding: 18, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.42)' }, badge: { position: 'absolute', top: 14, right: 14, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 5 }, badgeText: { fontSize: 11, fontWeight: '800' }, company: { color: '#fff', fontSize: 13, fontWeight: '700' }, title: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 2 }, subtitle: { color: '#fff', fontSize: 13, marginTop: 3 }, cta: { color: '#fff', fontWeight: '800', marginTop: 8 }, dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 8 }, dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#bbb' }, activeDot: { width: 18, backgroundColor: '#111' } });
