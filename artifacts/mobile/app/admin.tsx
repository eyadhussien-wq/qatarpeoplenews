import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

const ADMIN_URL = process.env.EXPO_PUBLIC_ADMIN_URL ?? "";

export default function AdminScreen() {
  const router = useRouter();

  const openWebAdmin = async () => {
    if (ADMIN_URL) await Linking.openURL(ADMIN_URL);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>لوحة تحكم QPN</Text>
      <Text style={styles.text}>
        إدارة المحتوى أصبحت عبر لوحة تحكم ويب آمنة. لا يتم تخزين بيانات دخول الإدارة داخل تطبيق الهاتف.
      </Text>
      <TouchableOpacity
        disabled={!ADMIN_URL}
        style={[styles.button, !ADMIN_URL && styles.disabled]}
        onPress={openWebAdmin}
      >
        <Text style={styles.buttonText}>{ADMIN_URL ? "فتح لوحة التحكم" : "لوحة الويب غير مهيأة بعد"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondary} onPress={() => router.back()}>
        <Text style={styles.secondaryText}>رجوع</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", alignItems: "center", gap: 16 },
  title: { fontSize: 26, fontWeight: "800" },
  text: { maxWidth: 520, textAlign: "center", lineHeight: 24, color: "#667085" },
  button: { width: "100%", maxWidth: 420, paddingVertical: 14, borderRadius: 12, backgroundColor: "#172033", alignItems: "center" },
  disabled: { opacity: 0.5 },
  buttonText: { color: "#FFF", fontWeight: "800" },
  secondary: { padding: 10 },
  secondaryText: { color: "#172033", fontWeight: "700" },
});
