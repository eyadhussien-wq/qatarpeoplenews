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

function SectionHeader({ title }: { title: string }) {
  const colors = useColors();
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.headerLine, { backgroundColor: colors.border }]} />
      <View style={styles.headerCenter}>
        <Ionicons name="star" size={11} color={colors.gold} />
        <Text style={[styles.headerText, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>{title}</Text>
        <Ionicons name="star" size={11} color={colors.gold} />
      </View>
      <View style={[styles.headerLine, { backgroundColor: colors.border }]} />
    </View>
  );
}

export default function RadioSection() {
  const colors = useColors();
  const { radioStations } = useApp();
  const webAudioRef = useRef<HTMLAudioElement | null>(null);
  const nativeAudioRef = useRef<Audio.Sound | null>(null);
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
    }).catch((error) => console.error('[Radio] Unable to configure audio mode', error));
  }, []);

  const stopCurrent = useCallback(async () => {
    if (webAudioRef.current) {
      webAudioRef.current.pause();
      webAudioRef.current.src = '';
      webAudioRef.current = null;
    }
    if (nativeAudioRef.current) {
      const sound = nativeAudioRef.current;
      nativeAudioRef.current = null;
      try { await sound.stopAsync(); } catch (error) { console.warn('[Radio] Native stop failed', error); }
      try { await sound.unloadAsync(); } catch (error) { console.warn('[Radio] Native unload failed', error); }
    }
    setIsPlaying(false);
    setIsBuffering(false);
    setStreamError(false);
  }, []);

  const playStation = useCallback(async (station: RadioStation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStreamError(false);
    setIsBuffering(true);
    await stopCurrent();
    setActiveStation(station);
    if (Platform.OS === 'web') {
        const audio = new globalThis.Audio(station.url);
        audio.preload = 'auto';
        audio.addEventListener('playing', () => setIsPlaying(true));
        audio.addEventListener('playing', () => setIsBuffering(false));
        audio.addEventListener('canplay', () => setIsBuffering(false));
        audio.addEventListener('waiting', () => setIsBuffering(true));
        audio.addEventListener('error', () => {
          console.warn('[Radio] Web stream unavailable', { station: station.name, url: station.url, error: audio.error });
          setIsBuffering(false);
          setIsPlaying(false);
          setStreamError(true);
            Alert.alert('تعذر تشغيل المحطة', 'المحطة غير متاحة حالياً. جرّب محطة أخرى.');
        });
        webAudioRef.current = audio;
        audio.play().catch((error) => {
          console.warn('[Radio] Web stream is not ready yet', { station: station.name, url: station.url, error });
          setIsBuffering(false);
          setIsPlaying(false);
          setStreamError(true);
        });
        setIsPlaying(true);
    } else {
      try {
        const { sound } = await Audio.Sound.createAsync(
          {
            uri: station.url,
            overrideExtension: station.url.includes('.m3u8') ? 'm3u8' : 'mp3',
          } as Parameters<typeof Audio.Sound.createAsync>[0],
          {
            shouldPlay: true,
            progressUpdateIntervalMillis: 1000,
            shouldCorrectPitch: false,
            volume: 1,
            isMuted: false,
            downloadFirst: false,
          } as Parameters<typeof Audio.Sound.createAsync>[1],
          (status: AVPlaybackStatus) => {
            if (!status.isLoaded) {
              if (status.error) {
                setIsPlaying(false);
                setIsBuffering(false);
                setStreamError(true);
                Alert.alert('تعذر تشغيل المحطة', 'المحطة غير متاحة حالياً. جرّب محطة أخرى.');
              }
              return;
            }
            setIsBuffering(status.isBuffering);
            setIsPlaying(status.isPlaying);
          },
        );
        nativeAudioRef.current = sound;
      } catch (error) {
        console.warn('[Radio] Mobile stream failed:', error);
        setIsPlaying(false);
        setIsBuffering(false);
        setStreamError(true);
        Alert.alert('تعذر تشغيل المحطة', 'المحطة غير متاحة حالياً. جرّب محطة أخرى.');
      }
    }
  }, [stopCurrent]);

  const togglePlayback = async () => {
    if (!activeStation) return;
    if (isPlaying) {
      if (Platform.OS === 'web') webAudioRef.current?.pause();
      setIsBuffering(false);
      setIsPlaying(false);
    } else {
      try {
        if (Platform.OS === 'web') {
          setIsBuffering(true);
          webAudioRef.current?.play().catch((error) => console.warn('[Radio] Web resume is still pending', error));
        } else {
          setIsBuffering(true);
          await nativeAudioRef.current?.playAsync();
        }
        setIsPlaying(true);
      } catch (runtimeError) {
        console.warn('[Radio] Stream resume is still pending', runtimeError);
        setIsBuffering(true);
      }
    }
  };

  useEffect(() => () => { void stopCurrent(); }, [stopCurrent]);

  return (
    <View style={styles.container}>
      <SectionHeader title="بث إذاعي وبودكاست" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {radioStations.map(station => (
          <TouchableOpacity
            key={station.id}
            style={styles.card}
            onPress={() => {
              if (activeStation?.id === station.id) void togglePlayback();
              else void playStation(station);
            }}
            activeOpacity={0.8}
          >
            <LinearGradient colors={[station.color, darken(station.color)]} style={styles.cardGradient}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <Ionicons name="radio" size={28} color={colors.gold} />
              </View>
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
            <Text style={styles.liveLabel}>
              {isBuffering ? '◌ جارٍ التحميل…' : streamError ? 'المحطة غير متاحة حالياً' : '● مباشر الآن'}
            </Text>
            <Text style={styles.playerStation} numberOfLines={1}>
              {streamError ? 'جرّب محطة أخرى' : activeStation.name}
            </Text>
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
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  headerText: { fontSize: 15 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 10, gap: 12 },
  card: { width: 122, height: 132, borderRadius: 16, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.18, shadowRadius: 6 },
  cardGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10, gap: 7 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  stationName: { color: '#FFFFFF', fontSize: 12, textAlign: 'center', lineHeight: 17, fontFamily: 'Inter_600SemiBold' },
  playBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  playerBar: { marginHorizontal: 12, marginTop: 8, borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10, elevation: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8 },
  playerButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  playerInfo: { flex: 1, alignItems: 'flex-end', gap: 2 },
  liveLabel: { color: '#FFB3B3', fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  playerStation: { color: '#FFFFFF', fontSize: 13, fontFamily: 'Inter_600SemiBold', textAlign: 'right' },
  closePlayer: { padding: 4 },
});