import React, { useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

export function RadioStreamPlayer({ streamUrl, colors }: { streamUrl: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.playerContainer}>
      {Platform.OS === 'web' ? (
        <iframe
          src={streamUrl}
          style={styles.iframe}
          allow="autoplay; encrypted-media"
          title="Radio Player"
        />
      ) : (
        <WebView
          source={{ uri: streamUrl }}
          style={styles.webview}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => <ActivityIndicator style={styles.loader} size="large" color={colors.gold} />}
          userAgent="Mozilla/5.0 (Linux; Android 12; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
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
          <TouchableOpacity
            key={station.id}
            style={styles.card}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setActiveStation(activeStation?.id === station.id ? null : station);
            }}
            activeOpacity={0.8}
          >
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
        <>
          <View style={[styles.playerHeader, { backgroundColor: colors.primaryDark }]}>
            <Text style={styles.playerStation}>{activeStation.name}</Text>
            <TouchableOpacity onPress={() => setActiveStation(null)} style={styles.closePlayer}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <RadioStreamPlayer streamUrl={activeStation.url} colors={colors} />
        </>
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
  playerHeader: { height: 38, marginHorizontal: 12, marginTop: 8, paddingHorizontal: 10, borderTopLeftRadius: 12, borderTopRightRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  playerStation: { color: '#FFFFFF', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  closePlayer: { padding: 4 },
  playerContainer: { height: 200, width: '100%', borderRadius: 16, overflow: 'hidden', backgroundColor: '#000000', marginVertical: 12 },
  webview: { flex: 1 },
  iframe: { width: '100%', height: '100%', borderWidth: 0 },
  loader: { position: 'absolute', top: '45%', left: '45%' },
});