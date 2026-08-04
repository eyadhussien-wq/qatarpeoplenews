import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp, type RadioStation } from '@/context/AppContext';

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

function darken(hex: string, n = 30): string {
  const v = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (v >> 16) - n);
  const g = Math.max(0, ((v >> 8) & 0xff) - n);
  const b = Math.max(0, (v & 0xff) - n);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function StationCard({ station }: { station: RadioStation }) {
  const colors = useColors();

  const handlePlay = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS === 'web') {
      (window as Window).open(station.url, '_blank');
    } else {
      await WebBrowser.openBrowserAsync(station.url);
    }
  };

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={[station.color, darken(station.color)]}
        style={styles.cardGradient}
      >
        <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
          <Ionicons name="radio" size={30} color={colors.gold} />
        </View>
        <Text style={[styles.stationName, { fontFamily: 'Inter_600SemiBold' }]} numberOfLines={2}>
          {station.name}
        </Text>
        <TouchableOpacity
          style={[styles.playBtn, { backgroundColor: colors.gold }]}
          onPress={handlePlay}
          activeOpacity={0.8}
        >
          <Ionicons name="play" size={16} color={colors.primaryDark} />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

export default function RadioSection() {
  const { radioStations } = useApp();

  return (
    <View style={styles.container}>
      <SectionHeader title="بث إذاعي وبودكاست" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {radioStations.map(s => (
          <StationCard key={s.id} station={s} />
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    gap: 12,
  },
  card: {
    width: 136,
    height: 162,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 10,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationName: {
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
