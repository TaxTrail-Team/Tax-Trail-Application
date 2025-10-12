import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { fetchGoogleLiveRate } from "../lib/api";
import { currencyToFlag, codeToNiceName } from "../lib/currency";
import QuickCurrencyPicker from "../../components/QuickCurrencyPicket";
import { theme } from "../../theme";

type Pt = { ts: string; rate: number; via: "google" | "fallback" };

const ALL_CURRENCIES = [
  "USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "LKR", "CHF", "CNY", "HKD",
  "SGD", "NZD", "AED", "SAR", "KRW", "SEK", "NOK", "DKK", "ZAR", "TRY", "THB",
  "PKR", "BDT", "IDR", "MYR", "PHP", "VND", "PLN", "CZK", "RON", "BGN", "HUF",
  "ILS", "EGP", "MXN", "BRL", "CLP", "PEN", "COP", "MAD", "NGN", "KES", "GHS",
  "UGX", "TZS", "ISK", "HRK"
];

export default function LiveRates({ route }: any) {
  const base = "LKR";
  const [target, setTarget] = useState<string>(route?.params?.target ?? "USD");

  const [history, setHistory] = useState<Pt[]>([]);
  const [running, setRunning] = useState(true);
  const [currencyModal, setCurrencyModal] = useState(false);
  const timerRef = useRef<any>(null);

  const minMax = useMemo(() => {
    const vals = history.map((h) => h.rate);
    if (!vals.length) return { min: 0, max: 0 };
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }, [history]);

  const norm = (v: number) => {
    const { min, max } = minMax;
    if (max === min) return 50;
    return 10 + ((v - min) / (max - min)) * 90;
  };

  async function tick() {
    try {
      const res = await fetchGoogleLiveRate({ base, target });
      setHistory((prev) => {
        const next = [...prev, { ts: res.rate_ts, rate: res.rate, via: res.via }];
        return next.slice(-60);
      });
    } catch (e) {
      // silently ignore
    }
  }

  // restart fetching when target changes or running state changes
  useEffect(() => {
    setHistory([]); // clear old data on currency change
    if (running) {
      tick();
      timerRef.current = setInterval(tick, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [target, running]);

  const latest = history[history.length - 1];

  const selectedCurrencyLabel = `${currencyToFlag(target)}  ${target} — ${codeToNiceName(target)}`;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📈 Live Exchange Rates</Text>
        <Text style={styles.subtitle}>{base} → {target} • updates every 5s</Text>
      </View>

      {/* Target currency dropdown (modal) */}
      <View style={styles.currencySelector}>
        <Text style={styles.pickerLabel}>Target Currency</Text>
        <Pressable onPress={() => setCurrencyModal(true)} style={styles.currencyBtn}>
          <Text style={styles.currencyBtnTxt}>{selectedCurrencyLabel}</Text>
        </Pressable>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable
          onPress={() => setRunning(!running)}
          style={[styles.btn, running ? styles.btnStop : styles.btnStart]}
        >
          <Text style={styles.btnText}>{running ? "Pause" : "Resume"}</Text>
        </Pressable>
        <Pressable onPress={() => setHistory([])} style={[styles.btn, styles.btnClear]}>
          <Text style={styles.btnText}>Clear</Text>
        </Pressable>
      </View>

      {/* Latest card */}
      <View style={styles.card}>
        <Text style={styles.label}>Latest</Text>
        <Text style={styles.value}>
          {latest ? latest.rate.toFixed(6) : "—"} {target}
        </Text>
        <Text style={styles.meta}>
          {latest ? new Date(latest.ts).toLocaleTimeString() : ""}
          {latest ? ` • ${latest.via}` : ""}
        </Text>
      </View>

      {/* History chart */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {history.length === 0 ? (
          <Text style={styles.emptyText}>Waiting for data…</Text>
        ) : (
          history.slice().reverse().map((pt, i) => (
            <View key={`${pt.ts}-${i}`} style={styles.row}>
              <Text style={styles.time}>{new Date(pt.ts).toLocaleTimeString()}</Text>
              <View style={styles.barWrapper}>
                <View style={[styles.bar, { width: `${norm(pt.rate)}%` }]} />
              </View>
              <Text style={styles.rateText}>{pt.rate.toFixed(6)}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Currency modal */}
      <QuickCurrencyPicker
        visible={currencyModal}
        onClose={() => setCurrencyModal(false)}
        options={ALL_CURRENCIES.map(code => ({ code }))}
        value={target}
        onSelect={setTarget}
      />

      {history.length === 0 && (
        <ActivityIndicator size="large" color={theme.color.primary} style={{ marginTop: 20 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.color.bg },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: "#e0e7ff",
    borderBottomWidth: 1,
    borderColor: "#c7d2fe",
  },
  title: { fontSize: 22, fontWeight: "800", color: "#000000ff" },
  subtitle: { fontSize: 13, color: "#232629ff", marginTop: 4 },

  currencySelector: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  pickerLabel: {
    fontSize: 12,
    color: theme.color.textMuted,
    marginBottom: 4,
  },
  currencyBtn: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    elevation: 2,
  },
  currencyBtnTxt: {
    fontSize: 14,
    color: theme.color.textDark,
  },

  controls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginVertical: 12,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnStart: { backgroundColor: "#22c55e" },
  btnStop: { backgroundColor: "#ef4444" },
  btnClear: { backgroundColor: "#5f6b7cff" },
  btnText: {
    color: "white",
    fontWeight: "600",
  },

  card: {
    marginHorizontal: 16,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  label: {
    fontSize: 12,
    color: theme.color.textMuted,
  },
  value: {
    fontSize: 26,
    fontWeight: "800",
    marginTop: 4,
    color: theme.color.textDark,
  },
  meta: {
    marginTop: 6,
    fontSize: 13,
    color: theme.color.textMuted,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  time: { width: 70, fontSize: 13, color: theme.color.textDark },
  barWrapper: {
    flex: 1,
    height: 10,
    backgroundColor: theme.color.lightGray,
    borderRadius: 999,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    backgroundColor: theme.color.primary,
  },
  rateText: {
    marginLeft: 8,
    width: 90,
    textAlign: "right",
    fontSize: 13,
    color: theme.color.textDark,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: theme.color.textMuted,
  },
});
