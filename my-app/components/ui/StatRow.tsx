import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../theme";

export default function StatRow({ items, target }: { items: number[]; target: string }) {
  if (!items.length) return null;
  const total = items.reduce((s, x) => s + x, 0);
  const min = Math.min(...items);
  const max = Math.max(...items);
  const fmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
  return (
    <View style={styles.row}>
      <View style={styles.stat}><Text style={styles.h}>Total</Text><Text style={styles.v}>{fmt.format(total)} {target}</Text></View>
      <View style={styles.sep} />
      <View style={styles.stat}><Text style={styles.h}>Min</Text><Text style={styles.v}>{fmt.format(min)} {target}</Text></View>
      <View style={styles.sep} />
      <View style={styles.stat}><Text style={styles.h}>Max</Text><Text style={styles.v}>{fmt.format(max)} {target}</Text></View>
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#747474ff", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#d3d4d6ff" },
  stat: { flex: 1, alignItems: "center" },
  h: { color: "#000000ff", fontSize: 11, marginBottom: 4 },
  v: { color: "#000000ff", fontWeight: "800" },
  sep: { width: 1, height: 28, backgroundColor: "#1f2a3d" },
});
