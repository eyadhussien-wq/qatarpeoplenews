import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
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

function ChannelCard({ channel }: { channel: Channel }) {
  const colors = useColors();

  const handlePress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS === 'web') {
      (window as Window).open(channel.url, '_blank');
    } else {
      await WebBrowser.openBrowserAsync(channel.url);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={styles.card}>
      <LinearGradient
        colors={[channel.color, darken(channel.color, 25)]}
        style={styles.cardGradient}
      >
        <View style={[styles.liveBadge, { backgroundColor: colors.liveBadge }]}>
          <View style={styles.liveDot} />
          <Text style={[styles.liveText, { fontFamily: 'Inter_700Bold' }]}>LIVE</Text>
        </View>
        <View style={styles.playCircle}>
          <Ionicons name="play" size={22} color="#FFFFFF" />
        </View>
        <Text style={[styles.channelName, { fontFamily: 'Inter_600SemiBold' }]} numberOfLines={2}>
          {channel.name}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function LiveTVSection() {
  const { channels } = useApp();

  return (
    <View style={styles.container}>
      <SectionHeader title="شاهد قنواتك المفضلة مباشرة" />
      <View style={styles.grid}>
        {channels.map(ch => (
          <ChannelCard key={ch.id} channel={ch} />
        ))}
      </View>
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
