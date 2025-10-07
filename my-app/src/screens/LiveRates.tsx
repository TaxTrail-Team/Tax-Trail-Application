// app/screens/LiveRates.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { fetchGoogleLiveRate } from "../lib/api";
import { theme } from "../../theme";

type Pt = { ts: string; rate: number; via: "google" | "fallback" };

export default function LiveRates({ route, navigation }: any) {
  const base: string = route?.params?.base ?? "LKR";
  const target: string = route?.params?.target ?? "USD";

  const [running, setRunning] = useState(true);
  const [history, setHistory] = useState<Pt[]>([]);
  const timerRef = useRef<any>(null);

  const minMax = useMemo(() => {
    const vals = history.map(h => h.rate);
    const min = vals.length ? Math.min(...vals) : 0;
    const max = vals.length ? Math.max(...vals) : 0;
    return { min, max };
  }, [history]);

  const norm = (v: number) => {
    const { min, max } = minMax;
    if (max === min) return 50; // flat line
    return 10 + ((v - min) / (max - min)) * 90; // 10–100%
  };

  async function tick() {
    try {
      const res = await fetchGoogleLiveRate({ base, target });
      setHistory((prev) => {
        const next = [...prev, { ts: res.rate_ts, rate: res.rate, via: res.via }];
        return next.slice(-60); // keep last 60 points (~5 min at 5s interval)
      });
    } catch (e) {
      // swallow; show last known data
    }
  }

  useEffect(() => {
    if (running) {
      tick();
      timerRef.current = setInterval(tick, 5000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, base, target]);

  const latest = history[history.length - 1];

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Rate Changes</Text>
        <Text style={styles.subtitle}>
          {base} → {target} (updates every 5s)
        </Text>
      </View>

      <View style={styles.toolbar}>
        <Pressable onPress={() => setRunning(!running)} style={[styles.btn, running ? styles.btnStop : styles.btnStart]}>
          <Text style={styles.btnTxt}>{running ? "Pause" : "Resume"}</Text>
        </Pressable>
        <Pressable onPress={() => setHistory([])} style={[styles.btn, styles.btnClear]}>
          <Text style={styles.btnTxt}>Clear</Text>
        </Pressable>
      </View>

      <View style={styles.nowCard}>
        <Text style={styles.nowLabel}>Latest</Text>
        <Text style={styles.nowValue}>
          {latest ? `${latest.rate}` : "—"} {target}
        </Text>
        <Text style={styles.nowMeta}>
          {latest ? new Date(latest.ts).toLocaleTimeString() : ""} {latest ? `• ${latest.via}` : ""}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {history.length === 0 ? (
          <Text style={styles.empty}>Waiting for data…</Text>
        ) : (
          history.slice().reverse().map((pt, idx) => (
            <View key={`${pt.ts}-${idx}`} style={styles.row}>
              <Text style={styles.rowTime}>{new Date(pt.ts).toLocaleTimeString()}</Text>
              <View style={styles.barWrap}>
                <View style={[styles.bar, { width: `${norm(pt.rate)}%` }]} />
              </View>
              <Text style={styles.rowRate}>{pt.rate.toFixed(6)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 10, backgroundColor: "#d7def0ff" },
  title: { fontSize: 20, fontWeight: "900", color: "#000000ff" },
  subtitle: { color: "#000000ff", marginTop: 4 },

  toolbar: { flexDirection: "row", gap: 10, padding: 16 },
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  btnStart: { backgroundColor: "#22c55e" },
  btnStop: { backgroundColor: "#ef4444" },
  btnClear: { backgroundColor: "#64748b" },
  btnTxt: { color: "#051B11", fontWeight: "800" },

  nowCard: {
    marginHorizontal: 16, marginTop: 8,
    backgroundColor: "#fcfdffff", borderRadius: 12, borderWidth: 1, borderColor: "#1f2937",
    padding: 14,
  },
  nowLabel: { color: "#0e0e0eff", fontSize: 12 },
  nowValue: { color: "#000000ff", fontWeight: "900", fontSize: 22, marginTop: 4 },
  nowMeta: { color: "#000000ff", marginTop: 4 },

  empty: { color: "#000000ff", textAlign: "center", marginTop: 20 },

  row: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  rowTime: { color: "#000000ff", width: 90 },
  barWrap: { flex: 1, height: 10, backgroundColor: "#0c1627", borderRadius: 999, borderWidth: 1, borderColor: "#1f2a3d", overflow: "hidden" },
  bar: { height: "100%", backgroundColor: "#22c55e" },
  rowRate: { color: "#020202ff", width: 90, textAlign: "right" },
});
