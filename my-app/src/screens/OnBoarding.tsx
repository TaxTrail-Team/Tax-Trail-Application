import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";

import logo from "../assets/logo.png";
import secure from "../assets/secure.png"
import smart from "../assets/smart.png"

const { width } = Dimensions.get("window");

type Slide = {
  title: string;
  body: string;
  logo?: any;
  tagline?: string;
  backgroundColor?: string;
};

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const slides: Slide[] = [
    {
      title: "Welcome",
      body: "Track & convert taxes across currencies.",
      tagline: "Smarter taxes. Fewer surprises.",
      logo,
      backgroundColor: "#E0F7FA",
    },
    {
      title: "Secure",
      body: "Login with Appwrite. Your data stays private.",
      logo:secure,
      backgroundColor: "#E8F5E9",
    },
    {
      title: "Smart",
      body: "LangChain-powered conversions with live FX.",
      logo:smart,
      backgroundColor: "#FFF3E0",
    },
  ];

  const [i, setI] = useState(0);
  const last = i === slides.length - 1;
  const current = slides[i];

  return (
    <View style={[styles.screen, { backgroundColor: current.backgroundColor || "#fff" }]}>
      <View />

      <View style={styles.center}>
        {current.logo && (
          <>
            <Image source={current.logo} style={styles.logo} resizeMode="contain" />
            {current.tagline && (
              <Text style={styles.tagline}>{current.tagline}</Text>
            )}
          </>
        )}

        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.body}>{current.body}</Text>

        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                i === index && { backgroundColor: "#0F4C81" },
              ]}
            />
          ))}
        </View>
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
  screen: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 16,
    textAlign: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: "#0F4C81",
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    textAlign: "center",
    color: "#374151",
    paddingHorizontal: 24,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  linkText: {
    color: "#6b7280",
    fontSize: 16,
  },
  primaryText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#0F4C81",
  },
  dots: {
    flexDirection: "row",
    marginTop: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#d1d5db",
    marginHorizontal: 6,
  },
});
