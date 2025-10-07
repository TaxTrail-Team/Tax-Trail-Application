import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, StyleSheet , Pressable,TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import styles from "../../styles/converterStyles";
import { useNavigation } from "@react-navigation/native";
import {
  fetchCategories, fetchTaxes, fetchSymbols, convertFilters, agentConvert, UITax,
} from "../lib/api";
import { currencyToFlag, codeToNiceName } from "../lib/currency";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Chip from "../../components/ui/Chip";
import RatePill from "../../components/ui/RatePill";
import StatRow from "../../components/ui/StatRow";
import SkeletonRow from "../../components/ui/SkeletonRow";
import QuickCurrencyPicker from "../../components/QuickCurrencyPicket";
import { theme } from "../../theme";

export default function Converter() {
  const [categories, setCategories] = useState<string[]>([]);
  const [symbols, setSymbols] = useState<Record<string, { code: string; description: string }>>({});
  const [taxes, setTaxes] = useState<UITax[]>([]);
const navigation = useNavigation<any>();
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [year, setYear] = useState<number | undefined>(undefined);
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [target, setTarget] = useState<string>("USD");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<{ base: string; target: string; rate?: number; rate_ts?: string; items: UITax[] } | null>(null);

  const [currencyModal, setCurrencyModal] = useState(false);

  const fmt = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }), []);
  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 8 }, (_, i) => now - i);
  }, []);
  const uniqueAmounts = useMemo(() => {
    const s = Array.from(new Set(taxes.map(t => Number(t.amount)).filter(Number.isFinite)));
    return s.sort((a, b) => a - b);
  }, [taxes]);

  const currencyOptions = useMemo(() => {
    const entries = Object.entries(symbols);
    const base = entries.length
      ? entries.map(([code]) => ({ code })).sort((a, b) => a.code.localeCompare(b.code))
      : ["USD","EUR","GBP","INR","JPY","AUD","CAD","LKR","CHF","CNY","HKD","SGD","NZD","AED","SAR","KRW","SEK","NOK","DKK","ZAR","TRY","THB","PKR","BDT","IDR","MYR","PHP","VND","PLN","CZK","RON","BGN","HUF","ILS","EGP","MXN","BRL","CLP","PEN","COP","MAD","NGN","KES","GHS","UGX","TZS","ISK","HRK"].map(code => ({ code }));
    return base;
  }, [symbols]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(e => setErrorMsg(e?.message || "Failed to load categories"));
    fetchSymbols().then(setSymbols).catch(e => setErrorMsg(e?.message || "Failed to load currencies"));
  }, []);

  useEffect(() => {
    setAmount(undefined);
    setTaxes([]);
    fetchTaxes({ category, year }).then(setTaxes).catch(e => setErrorMsg(e?.message || "Failed to load taxes"));
  }, [category, year]);

  const isRateStale = useMemo(() => {
    if (!result?.rate_ts) return false;
    return Date.now() - new Date(result.rate_ts).getTime() > 30 * 60 * 1000;
  }, [result]);

  async function onConvert() {
    setErrorMsg(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await convertFilters({ category, year, amount, target });
      setResult(res);
    } catch (e: any) {
      try {
        const parts = [
          category ? `in category ${category}` : "",
          typeof year === "number" ? `for year ${year}` : "",
          typeof amount === "number" ? `with amount ${amount} LKR only` : "",
        ].filter(Boolean).join(" ");
        const out = await agentConvert(`Convert taxes ${parts}. Convert them to ${target}. Output JSON only.`);
        setResult(out && typeof out === "object" ? out : { base: "LKR", target, items: [] });
      } catch (err: any) {
        setErrorMsg(err?.message || "Conversion failed.");
        setResult({ base: "LKR", target, items: [] });
      }
    } finally {
      setLoading(false);
    }
  }
const categoriesSorted = useMemo(
  () => [...categories].filter(Boolean).sort((a, b) => a.localeCompare(b)),
  [categories]
);
  const summaryAmounts = useMemo(() => result?.items?.map(i => i.amount) ?? [], [result]);
  const selectedCurrencyLabel = `${currencyToFlag(target)}  ${target} — ${codeToNiceName(target)}`;

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.bg }}>
      {/* App header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tax Converter</Text>
        <Text style={styles.subtitle}>Convert LKR amounts with live FX and audit trail.</Text>
      </View>
 
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.space.lg, gap: theme.space.md }}>
        {errorMsg ? (
          <Card><Text style={{ color: theme.color.danger }}>{errorMsg}</Text></Card>
        ) : null}

    <Button
      title="See live rate changes"
      onPress={() => navigation.navigate("LiveRates", { base: "LKR", target })}
      style={{ marginTop: 10 }}
    />
        <Card>
          <Text style={styles.label}>Filters</Text>

          {/* category chips */}
          <View style={[styles.pickerWrap, { marginBottom: theme.space.md }]}>
  <Text style={styles.pickerLabel}>Category</Text>
  <Picker
    selectedValue={category}
    onValueChange={(v) => setCategory(v || undefined)}
  >
    <Picker.Item label="All" value={undefined as any} />
    {(categoriesSorted.length ? categoriesSorted : categories).map((c) => (
      <Picker.Item key={c} label={c} value={c} />
    ))}
  </Picker>
</View>

          {/* Year & Amount pickers */}
          <View style={{ flexDirection: "row", gap: theme.space.sm }}>
            <View style={styles.pickerWrap}>
              <Text style={styles.pickerLabel}>Year</Text>
              <Picker selectedValue={year} onValueChange={(v) => setYear(v || undefined)}>
                <Picker.Item label="Any" value={undefined as any} />
                {years.map((y) => <Picker.Item key={y} label={String(y)} value={y} />)}
              </Picker>
            </View>

            <View style={styles.pickerWrap}>
              <Text style={styles.pickerLabel}>Amount (LKR)</Text>
              <Picker
                selectedValue={amount}
                onValueChange={(v) => setAmount(v || undefined)}
                enabled={taxes.length > 0}
              >
                <Picker.Item label="Any" value={undefined as any} />
                {uniqueAmounts.map((a) => <Picker.Item key={a} label={String(a)} value={a} />)}
              </Picker>
            </View>
          </View>

          {/* Currency chooser */}
          <View style={{ marginTop: theme.space.sm }}>
            <Text style={styles.pickerLabel}>Target Currency</Text>
            <Pressable onPress={() => setCurrencyModal(true)} style={styles.currencyBtn}>
              <Text style={styles.currencyBtnTxt}>{selectedCurrencyLabel}</Text>
            </Pressable>
          </View>

          <Button title={loading ? "Converting..." : "Convert"} onPress={onConvert} disabled={loading} style={{ marginTop: theme.space.md }} />
        </Card>

        {/* Preview block */}
        <Card>
          <Text style={styles.label}>Preview (LKR)</Text>
          {taxes.length === 0 ? (
            <>
              <SkeletonRow /><SkeletonRow /><SkeletonRow />
              <Text style={{ color: theme.color.textMuted, marginTop: theme.space.sm }}>No matching LKR items yet.</Text>
            </>
          ) : (
            taxes.slice(0, 3).map((it) => (
              <View key={it.id} style={styles.previewRow}>
                <Text style={styles.previewTitle}>{it.name || "—"}</Text>
                <Text style={styles.previewMeta}>{it.category} • {it.year ?? "—"}</Text>
                <Text style={styles.previewAmount}>{fmt.format(it.amount)} LKR 🇱🇰</Text>
              </View>
            ))
          )}
        </Card>

        {/* Results */}
        {result && (
          <Card>
            <View style={{ gap: 8 }}>
              <RatePill base={result.base} target={result.target} rate={result.rate} ts={result.rate_ts} stale={isRateStale} />
              {summaryAmounts.length > 0 && <StatRow items={summaryAmounts} target={result.target} />}
            </View>

            {Array.isArray(result.items) && result.items.length > 0 ? (
              <View style={{ marginTop: theme.space.md }}>
                {result.items.map((it) => (
                  <View key={it.id} style={styles.resultCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resultName}>{it.name || "—"}</Text>
                      <Text style={styles.resultMeta}>{it.category} • {it.year ?? "—"}</Text>
                      <Text style={styles.auditText}>Base: {fmt.format(it.base_amount_lkr ?? 0)} LKR 🇱🇰</Text>
                    </View>
                    <View>
                      <Text style={styles.resultAmount}>{fmt.format(it.amount)} {it.currency} {currencyToFlag(it.currency)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No results</Text>
                <Text style={styles.emptyText}>Try removing filters or choose a different currency.</Text>
              </View>
            )}
          </Card>
        )}

        <View style={{ height: theme.space.lg }} />
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#464646ff" />
        </View>
      )}

      <QuickCurrencyPicker
        visible={currencyModal}
        onClose={() => setCurrencyModal(false)}
        options={currencyOptions}
        value={target}
        onSelect={setTarget}
      />
    </View>
  );
}

