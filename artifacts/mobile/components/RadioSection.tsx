import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Audio, type AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp, type RadioStation } from '@/context/AppContext';

const apiBase = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : '';

function darken(hex: string, n = 30): string {
  const v = parseInt(hex.replace('#', ''), 16);
  return `#${((Math.max(0, (v >> 16) - n) << 16) | (Math.max(0, ((v >> 8) & 0xff) - n) << 8) | Math.max(0, (v & 0xff) - n)).toString(16).padStart(6, '0')}`;
}

export function RadioStreamPlayer({ stationKey, stationName, directUrl }: { stationKey: RadioStation['key']; stationName: string; directUrl: string }) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let disposed = false;
    const playRadio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        const streamSource = Platform.OS === 'web'
          ? `${apiBase}/api/radio-proxy/${stationKey}`
          : directUrl;
        const { sound } = await Audio.Sound.createAsync(
          { uri: streamSource },
          { shouldPlay: true, progressUpdateIntervalMillis: 1000 },
          (status: AVPlaybackStatus) => {
            if (!status.isLoaded) {
              if (status.error) setError(true);
              return;
            }
            setIsPlaying(status.isPlaying);
          },
        );
        if (disposed) await sound.unloadAsync();
        else soundRef.current = sound;
      } catch (playbackError) {
        console.warn('[Radio] Playback failed', playbackError);
        setError(true);
      } finally {
        if (!disposed) setIsLoading(false);
      }
    };
    void playRadio();
    return () => {
      disposed = true;
      const sound = soundRef.current;
      soundRef.current = null;
      if (sound) void sound.unloadAsync();
    };
  }, [stationKey]);

  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current) return;
    if (isPlaying) await soundRef.current.pauseAsync();
    else await soundRef.current.playAsync();
  }, [isPlaying]);

  return (
    <View style={styles.playerBar}>
      <View style={styles.playerInfo}>
        <Text style={styles.playerStation}>{stationName}</Text>
        <Text style={styles.liveLabel}>{error ? 'تعذر الاتصال بالبث' : isLoading ? 'جارٍ الاتصال…' : isPlaying ? '● مباشر الآن' : 'متوقف مؤقتاً'}</Text>
      </View>
      {isLoading ? <ActivityIndicator color="#FFD700" /> : (
        <TouchableOpacity onPress={() => void togglePlayPause()} style={styles.playButton}>
          <Ionicons name={isPlaying ? 'pause-circle' : 'play-circle'} size={44} color="#FFD700" />
        </TouchableOpacity>
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
          <RadioStreamPlayer stationKey={activeStation.key} stationName={activeStation.name} directUrl={activeStation.directUrl} />
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
  playerBar: { minHeight: 78, borderRadius: 12, padding: 12, backgroundColor: '#1A1A1A', flexDirection: 'row', alignItems: 'center', gap: 12 },
  playerInfo: { flex: 1, alignItems: 'flex-end', gap: 3 },
  playerStation: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter_600SemiBold', textAlign: 'right' },
  liveLabel: { color: '#FFB3B3', fontSize: 11, textAlign: 'right' },
  playButton: { padding: 2 },
  closePlayer: { position: 'absolute', top: 4, left: 4, padding: 3 },
});