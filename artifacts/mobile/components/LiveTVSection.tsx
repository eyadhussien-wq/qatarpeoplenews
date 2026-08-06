import React from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp, type Channel } from '@/context/AppContext';

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

function darken(hex: string, n = 20): string {
  const v = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (v >> 16) - n);
  const g = Math.max(0, ((v >> 8) & 0xff) - n);
  const b = Math.max(0, (v & 0xff) - n);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function PlayerModal({ channel, onClose }: { channel: Channel | null; onClose: () => void }) {
  const colors = useColors();

  if (!channel) return null;

  return (
    <Modal visible={!!channel} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.playerModal, { backgroundColor: colors.card }]}>
          <View style={styles.playerHeader}>
            <Text style={[styles.playerTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>{channel.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityLabel="إغلاق المشغل">
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          {Platform.OS === 'web' ? (
            <View style={styles.iframeFrame}>
              {React.createElement('iframe', {
                src: channel.url,
                title: channel.name,
                allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
                allowFullScreen: true,
                sandbox: 'allow-scripts allow-same-origin allow-presentation',
                frameBorder: '0',
                style: { width: '100%', height: '100%', border: 0 },
              })}
            </View>
          ) : (
            <View style={[styles.nativeFallback, { backgroundColor: colors.primaryDark }]}>
              <Ionicons name="play-circle" size={64} color={colors.gold} />
              <Text style={styles.nativeFallbackText}>المشغل المضمّن متاح داخل نسخة الويب</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

function ChannelCard({ channel, onPress }: { channel: Channel; onPress: () => void }) {
  const colors = useColors();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.card}>
      <LinearGradient colors={[channel.color, darken(channel.color, 25)]} style={styles.cardGradient}>
        <View style={[styles.liveBadge, { backgroundColor: colors.liveBadge }]}><View style={styles.liveDot} /><Text style={[styles.liveText, { fontFamily: 'Inter_700Bold' }]}>LIVE</Text></View>
        <View style={styles.playCircle}><Ionicons name="play" size={22} color="#FFFFFF" /></View>
        <Text style={[styles.channelName, { fontFamily: 'Inter_600SemiBold' }]} numberOfLines={2}>{channel.name}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function LiveTVSection() {
  const { channels } = useApp();
  const [selectedChannel, setSelectedChannel] = React.useState<Channel | null>(null);

  return (
    <View style={styles.container}>
      <SectionHeader title="شاهد قنواتك المفضلة مباشرة" />
      <View style={styles.grid}>
        {channels.map(ch => (
          <ChannelCard key={ch.id} channel={ch} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setSelectedChannel(ch); }} />
        ))}
      </View>
      <PlayerModal channel={selectedChannel} onClose={() => setSelectedChannel(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  playerModal: { width: '100%', maxWidth: 760, borderRadius: 16, overflow: 'hidden', elevation: 12 },
  playerHeader: { minHeight: 52, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  playerTitle: { fontSize: 16, textAlign: 'right', flex: 1 },
  closeButton: { padding: 6, marginLeft: 8 },
  iframeFrame: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' },
  nativeFallback: { aspectRatio: 16 / 9, alignItems: 'center', justifyContent: 'center', gap: 10 },
  nativeFallbackText: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
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
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 10,
  },
  card: {
    width: '47%',
    height: 122,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  cardGradient: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
    alignSelf: 'flex-end',
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 9,
  },
  playCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
    alignSelf: 'center',
  },
  channelName: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'right',
    lineHeight: 17,
  },
});
