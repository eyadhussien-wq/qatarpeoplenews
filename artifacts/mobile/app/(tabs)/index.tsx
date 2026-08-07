import React from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import Header from '@/components/Header';
import InfoBar from '@/components/InfoBar';
import HeroCarousel from '@/components/HeroCarousel';
import AdBanner from '@/components/AdBanner';
import LiveTVSection from '@/components/LiveTVSection';
import AffiliateGrid from '@/components/AffiliateGrid';
import RadioSection from '@/components/RadioSection';
import DealsSection from '@/components/DealsSection';
import Footer from '@/components/Footer';
import StickyAdBanner from '@/components/StickyAdBanner';
import DrawerMenu from '@/components/DrawerMenu';

// Extra bottom padding to clear the sticky ad banner
const STICKY_AD_HEIGHT = 64;

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const bottomPad = isWeb ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Fixed header */}
      <Header />

      {/* Main scrollable content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: STICKY_AD_HEIGHT + bottomPad + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <InfoBar />
        <HeroCarousel />
        <AdBanner />
        <LiveTVSection />
        <RadioSection />
        <DealsSection />
        <AffiliateGrid />
        <Footer />
      </ScrollView>

      {/* Sticky bottom ad */}
      <StickyAdBanner />

      {/* Side drawer overlay */}
      <DrawerMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
