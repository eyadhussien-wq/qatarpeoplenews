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

const generateAudioHtml = (hlsUrl: string) => {
  const safeUrl = JSON.stringify(hlsUrl);
  return `<!doctype html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
html,body{margin:0;height:100%;background:#1a1a1a;color:#fff;font-family:Arial,sans-serif}
body{display:flex;align-items:center;padding:0 14px;box-sizing:border-box}
audio{width:100%;height:48px;accent-color:#d4af37}
</style></head><body>
<audio id="player" controls autoplay playsinline></audio>
<script src="https://cdn.jsdelivr.net/npm/hls.js@1.6.16/dist/hls.min.js"></script>
<script>
const url=${safeUrl}, audio=document.getElementById('player');
if(audio.canPlayType('application/vnd.apple.mpegurl')){audio.src=url;audio.play().catch(()=>{});}
else if(window.Hls&&Hls.isSupported()){const hls=new Hls({enableWorker:true});hls.loadSource(url);hls.attachMedia(audio);hls.on(Hls.Events.MANIFEST_PARSED,()=>audio.play().catch(()=>{}));}
</script></body></html>`;
};

export function RadioStreamPlayer({ streamUrl }: { streamUrl: string }) {
  const htmlContent = generateAudioHtml(streamUrl);
  return (
    <View style={styles.playerContainer}>
      {Platform.OS === 'web' ? (
        <iframe
          srcDoc={htmlContent}
          style={styles.iframe}
          allow="autoplay"
          title="Radio Player"
        />
      ) : (
        <WebView
          source={{ html: htmlContent, baseUrl: 'https://tabie.net' }}
          style={styles.webview}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
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
          <RadioStreamPlayer streamUrl={activeStation.url} />
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
  playerContainer: { height: 90, width: '100%', borderRadius: 12, overflow: 'hidden', backgroundColor: '#1a1a1a', marginVertical: 10 },
  webview: { flex: 1, backgroundColor: 'transparent' },
  iframe: { width: '100%', height: '100%', borderWidth: 0 },
});