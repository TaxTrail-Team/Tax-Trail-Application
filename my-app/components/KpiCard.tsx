// components/KpiCard.tsx
import React from 'react';
import { View, Text } from 'react-native';

export default function KpiCard({ label, value }: { label: string; value: number }) {
  const display = label === 'Anomalies' ? String(value) : `₹${Math.abs(value).toLocaleString()}`.replace('₹', '$');
  const prefix = label === 'Refunds' && value < 0 ? '-' : '';
  return (
    <View style={{ backgroundColor: '#E9EFEC', padding: 12, borderRadius: 14, flex: 1 }}>
      <Text style={{ color: '#16423C', fontSize: 12, fontWeight: '700' }}>{label}</Text>
      <Text style={{ color: '#16423C', fontSize: 18, fontWeight: '800', marginTop: 6 }}>
        {label === 'Anomalies' ? display : `${prefix}${display}`}
      </Text>
    </View>
  );
}
