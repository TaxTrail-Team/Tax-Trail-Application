import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';

export default function BudgetDashboard() {
  const cards = [
    { title: 'Total', value: '$4,16\n0' },
    { title: 'Payments', value: '$4,58\n0' },
    { title: 'Refunds', value: '-$420' },
    { title: 'Anomalies', value: '2' },
  ];

  const items = [
    { title: 'Income - 2025', subtitle: 'Wed Mar 12 2025 — +$1,200', note: 'Q1 payment' },
    { title: 'VAT - 2025', subtitle: 'Wed Feb 05 2025 — +$680', note: 'Feb return' },
    { title: 'PAYE - 2024', subtitle: 'Fri Dec 20 2024 — +$450', note: 'Payroll' },
    { title: 'Capital Gains - 2024', subtitle: 'Mon Sep 02 2024 — -$300', note: 'Refund adj.' },
    { title: 'Other - 2023', subtitle: '', note: '' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.color.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: theme.color.pill }}>TaxTrail Dashboard</Text>
      <Text style={{ marginTop: 6, color: theme.color.text, opacity: 0.7 }}>Quick view of your taxes (mock data)</Text>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
        {cards.map((c) => (
          <View key={c.title} style={{ backgroundColor: theme.color.card, borderRadius: theme.radius.md, padding: 14, width: '47%' }}>
            <Text style={{ color: theme.color.text, fontSize: 12, opacity: 0.7 }}>{c.title}</Text>
            <Text style={{ color: theme.color.pill, fontSize: 22, fontWeight: '800', marginTop: 8 }}>{c.value}</Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
        <TouchableOpacity style={{ backgroundColor: theme.color.pill, paddingVertical: 10, borderRadius: theme.radius.md, flex: 1 }}>
          <Text style={{ color: theme.color.text1, textAlign: 'center', fontWeight: '700' }}>Filters</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: theme.color.pill, paddingVertical: 10, borderRadius: theme.radius.md, flex: 1, opacity: 0.85 }}>
          <Text style={{ color: theme.color.text1, textAlign: 'center', fontWeight: '700' }}>Clear</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 14, gap: 10 }}>
        {items.map((it, idx) => (
          <View key={idx} style={{ backgroundColor: theme.color.card, borderRadius: theme.radius.md, padding: 12 }}>
            <Text style={{ fontWeight: '700', color: theme.color.pill }}>{it.title}</Text>
            {!!it.subtitle && <Text style={{ marginTop: 4, color: theme.color.text }}>{it.subtitle}</Text>}
            {!!it.note && (
              <Text style={{ marginTop: 2, color: theme.color.text, opacity: 0.7 }}>{it.note}</Text>
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity style={{ backgroundColor: theme.color.pill, paddingVertical: 12, borderRadius: theme.radius.md, marginTop: 16 }}>
        <Text style={{ color: theme.color.text1, textAlign: 'center', fontWeight: '700' }}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}


