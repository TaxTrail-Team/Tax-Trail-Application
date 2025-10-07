import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../theme";

export default function RatePill({ base, target, rate, ts, stale }: {
  base: string; target: string; rate?: number; ts?: string; stale?: boolean;
}) {
  return (
    <View style={[styles.pill, stale && { borderColor: "#f59e0b" }]}>
      <Text style={styles.txt}>
        🔁 {base}→{target} {typeof rate === "number" ? rate : "—"}
        {ts ? ` • ${new Date(ts).toLocaleTimeString()}` : ""}
        {stale ? " • cached" : ""}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  pill: {
    backgroundColor: theme.color.pill,
    borderRadius: 999,
    borderWidth: 1, borderColor: theme.color.border,
    paddingVertical: 6, paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  txt: { color: theme.color.text1, fontSize: 12, fontWeight: "700" },
});
