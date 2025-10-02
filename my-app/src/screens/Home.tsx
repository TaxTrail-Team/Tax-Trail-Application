import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { fetchTaxes } from '../lib/api';

export default function Home() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { fetchTaxes({}).then(setItems).catch(console.warn); }, []);
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Taxes (LKR)</Text>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderWidth: 1, borderRadius: 10, marginBottom: 8 }}>
            <Text style={{ fontWeight: '700' }}>{item.name} • {item.category} • {item.year}</Text>
            <Text>{item.amount} {item.currency}</Text>
          </View>
        )}
      />
    </View>
  );
}
