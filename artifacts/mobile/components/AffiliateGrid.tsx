import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp, type AffiliateProduct } from '@/context/AppContext';

const PLATFORM_COLORS: Record<string, string> = {
  temu: '#FF6000',
  amazon: '#FF9900',
};

const PLATFORM_LABELS: Record<string, string> = {
  temu: 'TEMU',
  amazon: 'AMAZON',
};

function SectionHeader({ title }: { title: string }) {
  const colors = useColors();
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.headerLine, { backgroundColor: colors.border }]} />
      <View style={styles.headerCenter}>
        <Ionicons name="star" size={11} color={colors.gold} />
        <Text style={[styles.headerText, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          {title}
        </Text>
        <Ionicons name="star" size={11} color={colors.gold} />
      </View>
      <View style={[styles.headerLine, { backgroundColor: colors.border }]} />
    </View>
  );
}

function ProductCard({ product }: { product: AffiliateProduct }) {
  const colors = useColors();
  const platformColor = PLATFORM_COLORS[product.platform] ?? '#888888';
  const platformLabel = PLATFORM_LABELS[product.platform] ?? product.platform.toUpperCase();

  const handleBuy = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'web') {
      (window as Window).open(product.buyUrl, '_blank');
    } else {
      await WebBrowser.openBrowserAsync(product.buyUrl);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
      <View style={[styles.platformBadge, { backgroundColor: platformColor }]}>
        <Text style={[styles.platformText, { fontFamily: 'Inter_700Bold' }]}>{platformLabel}</Text>
      </View>
      <View style={[styles.iconBox, { backgroundColor: colors.muted, borderRadius: 10 }]}>
        <Ionicons name="bag" size={30} color={platformColor} />
      </View>
      <View style={styles.infoBlock}>
        <Text style={[styles.productName, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={[styles.price, { color: platformColor, fontFamily: 'Inter_700Bold' }]}>
          {product.price}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.buyBtn, { backgroundColor: platformColor, borderRadius: 8 }]}
        onPress={handleBuy}
        activeOpacity={0.8}
      >
        <Text style={[styles.buyBtnText, { fontFamily: 'Inter_600SemiBold' }]}>اشتري الآن</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AffiliateGrid() {
  const { affiliates } = useApp();

  return (
    <View style={styles.container}>
      <SectionHeader title="عروض وتخفيضات حصرية" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.grid}>
        {affiliates.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 12,
    gap: 8,
  },
  headerLine: {
    flex: 1,
    height: 1,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  headerText: {
    fontSize: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    paddingHorizontal: 12,
    gap: 10,
  },
  card: {
    width: 146,
    minHeight: 148,
    borderWidth: 1,
    padding: 9,
    alignItems: 'flex-end',
    gap: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  platformBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    alignSelf: 'flex-end',
  },
  platformText: {
    color: '#FFFFFF',
    fontSize: 9,
  },
  iconBox: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  infoBlock: {
    width: '100%',
    alignItems: 'flex-end',
    gap: 3,
  },
  productName: {
    fontSize: 11,
    textAlign: 'right',
    lineHeight: 18,
  },
  price: {
    fontSize: 12,
  },
  buyBtn: {
    width: '100%',
    paddingVertical: 6,
    alignItems: 'center',
  },
  buyBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
});
