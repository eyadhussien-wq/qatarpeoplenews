import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp, type CarouselItem } from '@/context/AppContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HERO_IMAGES: Record<string, any> = {
  'hero-stadium': require('@/assets/images/hero-stadium.jpg'),
  'hero-doha': require('@/assets/images/hero-doha.jpg'),
};

function Slide({ item }: { item: CarouselItem }) {
  const colors = useColors();
  const imgSrc = item.imagePath ? HERO_IMAGES[item.imagePath] : null;

  const handlePress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'web') {
      (window as Window).open(item.actionUrl, '_blank');
    } else {
      await WebBrowser.openBrowserAsync(item.actionUrl);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={handlePress}
      style={[styles.slide, { backgroundColor: item.bgColor, width: SCREEN_WIDTH }]}
    >
      {imgSrc && (
        <Image source={imgSrc} style={styles.slideImage} resizeMode="cover" />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.82)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0.2 }}
        end={{ x: 0, y: 1 }}
      />
      <View style={styles.content}>
        <View style={[styles.liveBadge, { backgroundColor: colors.liveBadge }]}>
          <View style={styles.liveDot} />
          <Text style={[styles.liveText, { fontFamily: 'Inter_700Bold' }]}>مباشر</Text>
        </View>
        <Text style={[styles.title, { fontFamily: 'Inter_700Bold' }]} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.actionRow}>
          <Ionicons name="play-circle" size={18} color={colors.gold} />
          <Text style={[styles.subtitle, { color: colors.gold, fontFamily: 'Inter_500Medium' }]}>
            {item.subtitle}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HeroCarousel() {
  const { carousel } = useApp();
  const colors = useColors();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef = useRef(carousel.length);
  countRef.current = carousel.length;

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIdx(prev => {
        const next = (prev + 1) % countRef.current;
        scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
        return next;
      });
    }, 4500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const onScroll = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (idx >= 0 && idx < carousel.length) setActiveIdx(idx);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollEndDrag={onScroll}
        onMomentumScrollEnd={onScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
      >
        {carousel.map(item => (
          <Slide key={item.id} item={item} />
        ))}
      </ScrollView>

      {/* Dot indicators */}
      <View style={[styles.dots, { backgroundColor: colors.primaryDark }]}>
        {carousel.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === activeIdx ? colors.gold : 'rgba(255,255,255,0.35)',
                width: i === activeIdx ? 20 : 6,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  slide: {
    height: 220,
    overflow: 'hidden',
  },
  slideImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  content: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    right: 16,
    alignItems: 'flex-end',
    gap: 6,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'right',
    lineHeight: 26,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'right',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 5,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
