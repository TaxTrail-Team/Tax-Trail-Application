import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from '../types/navigation';

type SummaryScreenRouteProp = RouteProp<RootStackParamList, 'SummaryScreen'>;

export default function SummaryScreen() {
  const route = useRoute<SummaryScreenRouteProp>();
  const { summary } = route.params as { summary: string };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AI-Generated Budget Summary</Text>
      <Text style={styles.text}>{summary}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 15, textAlign: "center" },
  text: { fontSize: 16, color: "#2c3e50", lineHeight: 24 },
});
