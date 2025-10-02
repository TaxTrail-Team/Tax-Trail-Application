import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { fetchCategories, fetchTaxes, agentConvert } from '../lib/api';
import { Picker } from '@react-native-picker/picker';

export default function Converter() {
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [year, setYear] = useState<number | undefined>(undefined);
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [taxes, setTaxes] = useState<any[]>([]);
  const [target, setTarget] = useState<string>('USD');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchCategories().then(setCategories).catch(console.warn); }, []);

  useEffect(() => {
    fetchTaxes({ category, year }).then(setTaxes).catch(console.warn);
    setAmount(undefined);
  }, [category, year]);

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 8 }, (_, i) => now - i);
  }, []);

  const uniqueAmounts = useMemo(() => {
    const s = Array.from(new Set(taxes.map(t => t.amount)));
    return s.sort((a,b)=>a-b);
  }, [taxes]);

  async function onConvert() {
  setLoading(true); setResult(null);
  try {
    const parts = [
      category ? `in category ${category}` : '',
      typeof year === 'number' ? `for year ${year}` : '',
      typeof amount === 'number' ? `with amount ${amount} LKR only` : '',
    ].filter(Boolean).join(' ');

    const prompt = `List taxes ${parts}. Convert them to ${target}. Output JSON only.`;
    const out = await agentConvert(prompt);
    console.log('[agentConvert] response:', out);
    setResult(out); // out should be an object now thanks to Patch 1
  } catch (e) {
    console.warn(e);
  } finally {
    setLoading(false);
  }
}


  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '700' }}>Currency Converter</Text>

      <Text>Category</Text>
      <Picker selectedValue={category} onValueChange={(v) => setCategory(v || undefined)}>
        <Picker.Item label="-- select --" value={undefined as any} />
        {categories.map((c) => <Picker.Item key={c} label={c} value={c} />)}
      </Picker>

      <Text>Year</Text>
      <Picker selectedValue={year} onValueChange={(v) => setYear(v || undefined)}>
        <Picker.Item label="-- select --" value={undefined as any} />
        {years.map(y => <Picker.Item key={y} label={String(y)} value={y} />)}
      </Picker>

      <Text>Amount (LKR)</Text>
      <Picker selectedValue={amount} onValueChange={(v) => setAmount(v || undefined)}>
        <Picker.Item label="-- select --" value={undefined as any} />
        {uniqueAmounts.map(a => <Picker.Item key={a} label={String(a)} value={a} />)}
      </Picker>

      <Text>Target Currency</Text>
      <Picker selectedValue={target} onValueChange={(v) => setTarget(v)}>
        {['USD','EUR','GBP','INR','JPY','AUD','CAD','LKR'].map(c => <Picker.Item key={c} label={c} value={c} />)}
      </Picker>

      <TouchableOpacity onPress={onConvert} style={{ backgroundColor: 'black', padding: 12, borderRadius: 8 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Convert</Text>
      </TouchableOpacity>

      {loading ? <ActivityIndicator /> : null}

      {result && typeof result === 'object' ? (
        <View style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: '700' }}>Result target: {result.target}</Text>
          {Array.isArray(result.items) ? result.items.map((it:any) => (
            <View key={it.id} style={{ paddingVertical: 6 }}>
              <Text>{it.name} • {it.category} • {it.year}</Text>
              <Text style={{ fontWeight: '700' }}>{it.amount} {it.currency}</Text>
            </View>
          )) : <Text>{JSON.stringify(result)}</Text>}
        </View>
      ) : null}
    </View>
  );
}
