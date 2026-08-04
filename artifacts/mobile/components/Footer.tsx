import React from 'react';
import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';

const SOCIAL = [
  { id: 'fb', icon: 'facebook-f', url: 'https://facebook.com/Qatarpeoplenews/' },
  { id: 'ig', icon: 'instagram', url: 'https://www.instagram.com/qatar_people_news/' },
  { id: 'tw', icon: 'twitter', url: 'https://x.com/QatarPeopleNews' },
  { id: 'tk', icon: 'tiktok', url: 'https://www.tiktok.com/@qatarpeoplenews' },
];

const LINKS = [
  { label: 'سياسة الخصوصية', url: 'https://ahlqatar.com/privacy' },
  { label: 'شروط الاستخدام', url: 'https://ahlqatar.com/terms' },
  { label: 'للتسويق المباشر', url: 'mailto:marketing@ahlqatar.com' },
];

export default function Footer() {
  const colors = useColors();
  const isWeb = Platform.OS === 'web';

  const open = (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isWeb) (window as Window).open(url, '_blank');
    else Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.primaryDark, borderTopColor: 'rgba(201,160,32,0.25)' }]}>
      {/* Social icons */}
      <View style={styles.socialRow}>
        {SOCIAL.map(s => (
          <TouchableOpacity
            key={s.id}
            onPress={() => open(s.url)}
            style={[styles.socialBtn, { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(201,160,32,0.25)' }]}
            activeOpacity={0.7}
          >
            <FontAwesome5 name={s.icon} size={15} color={colors.gold} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Links row */}
      <View style={styles.linksRow}>
        {LINKS.map((link, i) => (
          <View key={link.label} style={styles.linkWrap}>
            {i > 0 && <Text style={[styles.sep, { color: 'rgba(255,255,255,0.25)' }]}>|</Text>}
            <TouchableOpacity onPress={() => open(link.url)}>
              <Text style={[styles.linkText, { color: '#FFFFFF', fontFamily: 'Inter_400Regular' }]}>
                {link.label}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Copyright */}
      <Text style={[styles.copyright, { color: '#FFFFFF', fontFamily: 'Inter_400Regular' }]}>
        جميع الحقوق محفوظة لـ أخبار أهل قطر 2026
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 14,
    marginTop: 8,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 10,
  },
  socialBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  linkWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sep: {
    fontSize: 12,
    paddingHorizontal: 4,
  },
  linkText: {
    fontSize: 12,
    paddingHorizontal: 4,
  },
  copyright: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
