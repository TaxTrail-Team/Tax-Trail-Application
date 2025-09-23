// components/FilterSheet.tsx
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { Button, Input } from './UI';
import type { Filter } from '../data/mockTax';

export default function FilterSheet({
  open,
  onClose,
  filters,
  onApply,
  years,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  filters: Filter;
  onApply: (f: Filter) => void;
  years: number[];
  categories: string[];
}) {
  const [year, setYear] = useState<number | undefined>(filters.year);
  const [selected, setSelected] = useState<string[]>(filters.categories || []);
  const [min, setMin] = useState<string>(filters.min?.toString() ?? '');
  const [max, setMax] = useState<string>(filters.max?.toString() ?? '');

  useEffect(() => {
    setYear(filters.year);
    setSelected(filters.categories || []);
    setMin(filters.min?.toString() ?? '');
    setMax(filters.max?.toString() ?? '');
  }, [filters, open]);

  const toggle = (c: string) => {
    setSelected((prev) => (prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]));
  };

  const apply = () => {
    onApply({
      year,
      categories: selected,
      min: min.length ? Number(min) : undefined,
      max: max.length ? Number(max) : undefined,
    });
    onClose();
  };

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' }}>
          <Text style={{ fontSize: 20, fontWeight: '800', marginBottom: 12 }}>Filters</Text>
          <ScrollView style={{ maxHeight: '75%' }}>
            <Text style={{ fontWeight: '700', marginBottom: 6 }}>Year</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {years.map(y => (
                <Pressable
                  key={y}
                  onPress={() => setYear(year === y ? undefined : y)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    backgroundColor: year === y ? '#16423C' : '#E9EFEC',
                  }}
                >
                  <Text style={{ color: year === y ? '#fff' : '#16423C', fontWeight: '700' }}>{y}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={{ fontWeight: '700', marginBottom: 6 }}>Categories</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {categories.map(c => {
                const active = selected.includes(c);
                return (
                  <Pressable
                    key={c}
                    onPress={() => toggle(c)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      backgroundColor: active ? '#16423C' : '#E9EFEC',
                    }}
                  >
                    <Text style={{ color: active ? '#fff' : '#16423C', fontWeight: '700' }}>{c}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={{ fontWeight: '700', marginBottom: 6 }}>Amount Range</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
              <Input value={min} onChangeText={setMin} placeholder="Min" keyboardType="numeric" style={{ flex: 1 }} />
              <Input value={max} onChangeText={setMax} placeholder="Max" keyboardType="numeric" style={{ flex: 1 }} />
            </View>
          </ScrollView>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
            <Button title="Close" onPress={onClose} />
            <Button title="Apply" onPress={apply} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
