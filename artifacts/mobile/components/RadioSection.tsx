import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp, type RadioStation } from '@/context/AppContext';

function darken(hex: string, n = 30): string {
  const v = parseInt(hex.replace('#', ''), 16);
  return `#${((Math.max(0, (v >> 16) - n) << 16) | (Math.max(0, ((v >> 8) & 0xff) - n) << 8) | Math.max(0, (v & 0xff) - n)).toString(16).padStart(6, '0')}`;
}

export function RadioStreamPlayer({ stationUrl = 'https://tabie.net/live' }: { stationUrl?: string }) {
  return (
    <View style={styles.playerFrame}>
      {Platform.OS === 'web' ? (
        <iframe
          src={stationUrl}
          style={{ width: '100%', height: '100%', border: 0, borderRadius: 12 }}
          allow="autoplay; fullscreen; picture-in-picture"
          title="Tabie Live Stream"
        />
      ) : (
        <WebView
          source={{ uri: stationUrl }}
          style={styles.webview}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          scalesPageToFit
        />
      )}
    </View>
  );
}

export default function RadioSection() {
  const colors = useColors();
  const { radioStations } = useApp();
  const [activeStation, setActiveStation] = useState<RadioStation | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={[styles.headerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.headerText, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>بث إذاعي وبودكاست</Text>
        <View style={[styles.headerLine, { backgroundColor: colors.border }]} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {radioStations.map((station) => (
          <TouchableOpacity key={station.id} style={styles.card} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setActiveStation(activeStation?.id === station.id ? null : station); }} activeOpacity={0.8}>
            <LinearGradient colors={[station.color, darken(station.color)]} style={styles.cardGradient}>
              <Ionicons name="radio" size={28} color={colors.gold} />
              <Text style={styles.stationName} numberOfLines={2}>{station.name}</Text>
              <View style={[styles.playBtn, { backgroundColor: colors.gold }]}>
                <Ionicons name={activeStation?.id === station.id ? 'radio' : 'play'} size={15} color={colors.primaryDark} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {activeStation && (
        <View style={styles.playerContainer}>
          <RadioStreamPlayer stationUrl={activeStation.url} />
          <TouchableOpacity onPress={() => setActiveStation(null)} style={styles.closePlayer}><Ionicons name="close" size={20} color="#FFFFFF" /></TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 18, marginBottom: 12, gap: 8 },
  headerLine: { flex: 1, height: 1 },
  headerText: { fontSize: 15 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 10, gap: 12 },
  card: { width: 122, height: 132, borderRadius: 16, overflow: 'hidden', elevation: 4 },
  cardGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10, gap: 7 },
  stationName: { color: '#FFFFFF', fontSize: 12, textAlign: 'center', lineHeight: 17, fontFamily: 'Inter_600SemiBold' },
  playBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  playerContainer: { marginHorizontal: 12, marginTop: 8, position: 'relative' },
  playerFrame: { height: 180, width: '100%', borderRadius: 12, overflow: 'hidden', backgroundColor: '#000', marginVertical: 10 },
  webview: { flex: 1, backgroundColor: '#000' },
  closePlayer: { position: 'absolute', top: 4, left: 4, padding: 3 },
});