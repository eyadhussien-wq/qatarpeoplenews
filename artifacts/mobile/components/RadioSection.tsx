import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
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
  const nativeWebViewRef = useRef<WebView>(null);
  const [activeStation, setActiveStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [streamError, setStreamError] = useState(false);

  const stopCurrent = useCallback(async () => {
    if (webAudioRef.current) {
      webAudioRef.current.pause();
      webAudioRef.current.src = '';
      webAudioRef.current = null;
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
    }
  }, [stopCurrent]);

  const togglePlayback = async () => {
    if (!activeStation) return;
    if (isPlaying) {
      if (Platform.OS === 'web') webAudioRef.current?.pause();
      // The hidden Video is unmounted below when isPlaying becomes false.
      setIsBuffering(false);
      setIsPlaying(false);
    } else {
      try {
        if (Platform.OS === 'web') {
          setIsBuffering(true);
          webAudioRef.current?.play().catch((error) => console.warn('[Radio] Web resume is still pending', error));
        } else setIsBuffering(true);
        setIsPlaying(true);
      } catch (runtimeError) {
        console.warn('[Radio] Stream resume is still pending', runtimeError);
        setIsBuffering(true);
      }
    }
  };

  useEffect(() => () => { void stopCurrent(); }, [stopCurrent]);

  const handleNativeWebViewMessage = (event: WebViewMessageEvent) => {
    const message = event.nativeEvent.data;
    if (message === 'playing') {
      setStreamError(false);
      setIsBuffering(false);
      setIsPlaying(true);
    } else if (message === 'buffering') {
      setIsBuffering(true);
    } else if (message === 'error') {
      setIsPlaying(false);
      setIsBuffering(false);
      setStreamError(true);
      Alert.alert('تعذر تشغيل المحطة', 'المحطة غير متاحة حالياً. جرّب محطة أخرى.');
    }
  };

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
      {Platform.OS !== 'web' && activeStation && isPlaying && (
        <View style={styles.hiddenWebView}>
          <WebView
            ref={nativeWebViewRef}
            originWhitelist={['*']}
            source={{
              html: `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body><audio id="radioPlayer" preload="none" src="${activeStation.url}"></audio>
<script>
const audio = document.getElementById('radioPlayer');
audio.onwaiting = () => window.ReactNativeWebView.postMessage('buffering');
audio.onplaying = () => window.ReactNativeWebView.postMessage('playing');
audio.onerror = () => window.ReactNativeWebView.postMessage('error');
audio.play().then(() => window.ReactNativeWebView.postMessage('playing')).catch(() => window.ReactNativeWebView.postMessage('error'));
</script></body></html>`,
            }}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onMessage={handleNativeWebViewMessage}
          />
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
  hiddenWebView: { height: 1, width: 1, opacity: 0.01, position: 'absolute' },
});