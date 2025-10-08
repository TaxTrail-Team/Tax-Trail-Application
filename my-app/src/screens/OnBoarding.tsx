import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";

// 1) Put your logo at: src/assets/logo.png (or adjust the path below)
import logo from "../assets/logo.png";
 // <- update this path if needed

type Slide = {
  title: string;
  body: string;
  // Optional fields for the first slide
  logo?: any;
  tagline?: string;
};

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const slides: Slide[] = [
    {
      title: "Welcome",
      body: "Track & convert taxes across currencies.",
      tagline: "Smarter taxes. Fewer surprises.",
      logo, // only first slide has a logo
    },
    { title: "Secure", body: "Login with Appwrite. Your data stays private." },
    { title: "Smart", body: "LangChain-powered conversions with live FX." },
  ];

  const [i, setI] = useState(0);
  const last = i === slides.length - 1;
  const current = slides[i];

  return (
    <View style={styles.screen}>
      <View />

      <View style={styles.center}>
        {/* Show logo & tagline when provided (i.e., first slide) */}
        {current.logo ? (
          <>
            <Image source={current.logo} style={styles.logo} resizeMode="contain" />
            {current.tagline ? <Text style={styles.tagline}>{current.tagline}</Text> : null}
          </>
        ) : null}

        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.body}>{current.body}</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={onDone}>
          <Text style={styles.linkText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => (last ? onDone() : setI(i + 1))}>
          <Text style={styles.primaryText}>{last ? "Done" : "Next"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, justifyContent: "space-between" },
  center: { alignItems: "center" },
  logo: { width: 120, height: 120, marginBottom: 8 },
  tagline: { fontSize: 14, color: "#6b7280", marginBottom: 16, textAlign: "center" },
  title: { fontSize: 28, fontWeight: "700", textAlign: "center" },
  body: { fontSize: 16, marginTop: 12, textAlign: "center", color: "#111827" },
  footer: { flexDirection: "row", justifyContent: "space-between" },
  linkText: { color: "#6b7280" },
  primaryText: { fontWeight: "700" },
});
