import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';

const VISIT_QATAR = 'https://visitqatar.com/ar';
const places = [
  { id: 'souq-waqif', title: 'سوق واقف', subtitle: 'سوق ثقافي وتراثي', url: 'https://souqwaqif.qa/', logo: 'سوق واقف', image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=900&q=85' },
  { id: 'katara', title: 'حي كتارا الثقافي', subtitle: 'فنون وشاطئ', url: 'https://www.katara.net/ar', logo: 'كتارا', image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=900&q=85' },
  { id: 'msheireb', title: 'مشيرب قلب الدوحة', subtitle: 'تراث مستدام وعصري', url: 'https://www.msheireb.com/ar/', logo: 'مشيرب', image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=900&q=85' },
  { id: 'mia', title: 'متحف الفن الإسلامي', subtitle: 'فن وثقافة عالمية', url: 'https://mia.org.qa/ar/', logo: 'MIA', image: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=900&q=85' },
  { id: 'nmoq', title: 'متحف قطر الوطني', subtitle: 'قصة قطر عبر الزمن', url: 'https://nmoq.org.qa/ar/', logo: 'NMoQ', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=85' },
  { id: 'pearl', title: 'جزيرة اللؤلؤة', subtitle: 'مرسى وتسوق فاخر', url: 'https://www.thepearlqatar.com/ar', logo: 'اللؤلؤة', image: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=900&q=85' },
];

function PlaceCard({ place, onPress }: { place: typeof places[number]; onPress: () => void }) {
  const [failed, setFailed] = useState(false);
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.88} onPress={onPress}>
      {!failed && <Image source={{ uri: place.image }} style={styles.image} resizeMode="cover" onError={() => setFailed(true)} />}
      {failed && <View style={styles.imageFallback}><Ionicons name="location" size={30} color="#FFD700" /></View>}
      <LinearGradient colors={['transparent', 'rgba(38,5,15,0.96)']} style={styles.overlay} />
      <View style={styles.logo}><Text style={styles.logoText}>{place.logo}</Text></View>
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={2}>{place.title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{place.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function DiscoverQatarSection() {
  const openPlace = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url, {
        toolbarColor: '#580024',
        controlsColor: '#FFD700',
        dismissButtonStyle: 'close',
        readerMode: false,
      });
    } catch (error) {
      console.error('Failed to open Visit Qatar page', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>🇶🇦 اكتشف معالم قطر</Text>
          <Text style={styles.kicker}>تجارب لا تُنسى في قلب الدوحة</Text>
        </View>
        <TouchableOpacity onPress={() => void openPlace(`${VISIT_QATAR}/ar`)} style={styles.allButton}>
          <Text style={styles.allText}>عرض الكل</Text>
          <Ionicons name="arrow-back" size={14} color="#8A6420" />
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
        {places.map(place => <PlaceCard key={place.id} place={place} onPress={() => void openPlace(place.url)} />)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 14, marginBottom: 11 },
  heading: { color: '#36050C', fontSize: 18, fontWeight: '800', textAlign: 'right' },
  kicker: { color: '#80666B', fontSize: 11, textAlign: 'right', marginTop: 3 },
  allButton: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#D4AF37', borderRadius: 14, paddingHorizontal: 9, paddingVertical: 6 },
  allText: { color: '#8A6420', fontSize: 11, fontWeight: '800' },
  content: { paddingHorizontal: 16, gap: 10, paddingBottom: 8 },
  card: { width: 180, height: 230, borderRadius: 16, overflow: 'hidden', backgroundColor: '#4A0E17', elevation: 4 },
  image: { ...StyleSheet.absoluteFillObject, width: undefined, height: undefined },
  imageFallback: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: '#6D1A32' },
  overlay: { ...StyleSheet.absoluteFillObject },
  logo: { position: 'absolute', top: 12, right: 12, minWidth: 48, height: 34, paddingHorizontal: 8, borderRadius: 9, backgroundColor: 'rgba(255,253,249,0.94)', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#580024', fontSize: 11, fontWeight: '900', textAlign: 'center' },
  copy: { position: 'absolute', bottom: 12, left: 11, right: 11 },
  title: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', textAlign: 'right', lineHeight: 20 },
  subtitle: { color: '#FFE7A3', fontSize: 10, textAlign: 'right', marginTop: 3 },
});