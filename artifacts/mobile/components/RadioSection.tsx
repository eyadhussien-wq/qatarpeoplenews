import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

export function RadioStreamPlayer({ stationName, streamUrl, onClose }: { stationName: string; streamUrl: string; onClose: () => void }) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let disposed = false;
    let soundObject: Audio.Sound | null = null;
    const startAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        const { sound } = await Audio.Sound.createAsync(
          { uri: streamUrl },
          { shouldPlay: true },
          (status: AVPlaybackStatus) => {
            if (status.isLoaded) {
              setIsPlaying(status.isPlaying);
              setIsLoading(false);
            } else if (status.error) {
              setHasError(true);
              setIsLoading(false);
            }
          },
        );
        soundObject = sound;
        if (disposed) await sound.unloadAsync();
        else soundRef.current = sound;
      } catch (error) {
        console.error('Audio stream playback error:', error);
        if (!disposed) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };
    void startAudio();
    return () => {
      disposed = true;
      soundRef.current = null;
      if (soundObject) void soundObject.unloadAsync();
    };
  }, [streamUrl]);

  const togglePlayPause = useCallback(async () => {
    const sound = soundRef.current;
    if (!sound) return;
    if (isPlaying) await sound.pauseAsync();
    else await sound.playAsync();
  }, [isPlaying]);

  return (
    <View style={styles.audioBarContainer}>
      <View style={styles.infoContainer}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.stationTitle} numberOfLines={1}>{stationName}</Text>
      </View>
      <View style={styles.controlContainer}>
        {isLoading ? <ActivityIndicator color="#FFD700" size="small" /> : hasError ? (
          <Text style={styles.errorText}>خطأ في جلب البث</Text>
        ) : (
          <TouchableOpacity onPress={() => void togglePlayPause()}>
            <Ionicons name={isPlaying ? 'pause-circle' : 'play-circle'} size={42} color="#FFD700" />
          </TouchableOpacity>
        )}
      </View>
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
          <RadioStreamPlayer stationName={activeStation.name} streamUrl={activeStation.streamUrl} onClose={() => setActiveStation(null)} />
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
  playerContainer: { marginHorizontal: 12, marginTop: 8 },
  audioBarContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1C1C1E', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, marginVertical: 10, borderWidth: 1, borderColor: '#333' },
  infoContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  closeBtn: { marginRight: 10, padding: 4 },
  stationTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', flexShrink: 1 },
  controlContainer: { justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#FF6B6B', fontSize: 12 },
});