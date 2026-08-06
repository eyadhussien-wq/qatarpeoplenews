import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Audio, type AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp, type RadioStation } from '@/context/AppContext';

function darken(hex: string, n = 30): string {
  const v = parseInt(hex.replace('#', ''), 16);
  return `#${((Math.max(0, (v >> 16) - n) << 16) | (Math.max(0, ((v >> 8) & 0xff) - n) << 8) | Math.max(0, (v & 0xff) - n)).toString(16).padStart(6, '0')}`;
}

export default function RadioSection() {
  const colors = useColors();
  const { radioStations } = useApp();
  const soundRef = useRef<Audio.Sound | null>(null);
  const webAudioRef = useRef<HTMLAudioElement | null>(null);
  const [activeStation, setActiveStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [streamError, setStreamError] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    }).catch((error) => console.warn('[Radio] Audio mode setup failed', error));
  }, []);

  const stopCurrent = useCallback(async () => {
    webAudioRef.current?.pause();
    webAudioRef.current = null;
    if (soundRef.current) {
      const sound = soundRef.current;
      soundRef.current = null;
      try { await sound.stopAsync(); } catch {}
      try { await sound.unloadAsync(); } catch {}
    }
    setIsPlaying(false);
    setIsBuffering(false);
    setStreamError(false);
  }, []);

  const playStation = useCallback(async (station: RadioStation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await stopCurrent();
    setActiveStation(station);
    setIsBuffering(true);
    if (Platform.OS === 'web') {
      const audio = new globalThis.Audio(station.url);
      audio.preload = 'auto';
      audio.onplaying = () => { setIsPlaying(true); setIsBuffering(false); };
      audio.onwaiting = () => setIsBuffering(true);
      audio.onerror = () => { setIsPlaying(false); setIsBuffering(false); setStreamError(true); };
      webAudioRef.current = audio;
      audio.play().catch(() => { setIsPlaying(false); setIsBuffering(false); setStreamError(true); });
      return;
    }
    try {
      const source = {
          uri: station.url,
          overrideExtension: 'm3u8',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Referer: 'https://tabie.net/',
            Origin: 'https://tabie.net',
            Accept: '*/*',
          },
        } as Parameters<typeof Audio.Sound.createAsync>[0];
      const { sound } = await Audio.Sound.createAsync(
        source,
        { shouldPlay: true, progressUpdateIntervalMillis: 1000 },
        (status: AVPlaybackStatus) => {
          if (!status.isLoaded) {
            if (status.error) { setStreamError(true); setIsPlaying(false); setIsBuffering(false); }
            return;
          }
          setIsPlaying(status.isPlaying);
          setIsBuffering(status.isBuffering);
        },
      );
      soundRef.current = sound;
    } catch (error) {
      console.warn('[Radio] HLS playback failed', error);
      setStreamError(true);
      setIsBuffering(false);
    }
  }, [stopCurrent]);

  const togglePlayback = async () => {
    if (!activeStation) return;
    try {
      if (isPlaying) {
        if (Platform.OS === 'web') webAudioRef.current?.pause();
        else await soundRef.current?.pauseAsync();
        setIsPlaying(false);
      } else {
        setIsBuffering(true);
        if (Platform.OS === 'web') await webAudioRef.current?.play();
        else await soundRef.current?.playAsync();
      }
    } catch { setStreamError(true); setIsBuffering(false); }
  };

  useEffect(() => () => { void stopCurrent(); }, [stopCurrent]);

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={[styles.headerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.headerText, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>بث إذاعي وبودكاست</Text>
        <View style={[styles.headerLine, { backgroundColor: colors.border }]} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {radioStations.map((station) => (
          <TouchableOpacity key={station.id} style={styles.card} onPress={() => activeStation?.id === station.id ? void togglePlayback() : void playStation(station)} activeOpacity={0.8}>
            <LinearGradient colors={[station.color, darken(station.color)]} style={styles.cardGradient}>
              <Ionicons name="radio" size={28} color={colors.gold} />
              <Text style={styles.stationName} numberOfLines={2}>{station.name}</Text>
              <View style={[styles.playBtn, { backgroundColor: colors.gold }]}>
                <Ionicons name={activeStation?.id === station.id && isPlaying ? 'pause' : 'play'} size={15} color={colors.primaryDark} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {activeStation && (
        <View style={[styles.playerBar, { backgroundColor: colors.primaryDark }]}>
          <TouchableOpacity onPress={() => void togglePlayback()} style={[styles.playerButton, { backgroundColor: colors.gold }]}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={16} color={colors.primaryDark} />
          </TouchableOpacity>
          <View style={styles.playerInfo}>
            <Text style={styles.liveLabel}>{isBuffering ? '◌ جارٍ التحميل…' : streamError ? 'تعذر تشغيل البث' : '● مباشر الآن'}</Text>
            <Text style={styles.playerStation} numberOfLines={1}>{activeStation.name}</Text>
          </View>
          <TouchableOpacity onPress={() => { void stopCurrent(); setActiveStation(null); }} style={styles.closePlayer}>
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>
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
  playerBar: { marginHorizontal: 12, marginTop: 8, borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  playerButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  playerInfo: { flex: 1, alignItems: 'flex-end', gap: 2 },
  liveLabel: { color: '#FFB3B3', fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  playerStation: { color: '#FFFFFF', fontSize: 13, fontFamily: 'Inter_600SemiBold', textAlign: 'right' },
  closePlayer: { padding: 4 },
});