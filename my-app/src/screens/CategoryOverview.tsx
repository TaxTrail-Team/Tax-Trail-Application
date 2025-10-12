import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';

type RouteParams = {
  name: string;
  currentYearTotal: number;
  previousYearTotal?: number;
};

export default function CategoryOverview() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const params: RouteParams = route.params ?? { name: 'Unknown', currentYearTotal: 0, previousYearTotal: 0 };

  const diff = params.previousYearTotal != null ? params.currentYearTotal - params.previousYearTotal : null;
  const diffPct = diff != null && params.previousYearTotal ? Math.round((diff / params.previousYearTotal) * 100) : null;
  const isPositive = (diff ?? 0) >= 0;

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.bg, padding: 20 }}>
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: theme.color.pill }}>{params.name} Budget Overview</Text>
        <Text style={{ marginTop: 6, color: theme.color.text, opacity: 0.7 }}>{`Spending summary and trends for ${params.name}`}</Text>
      </View>

      <View style={{ backgroundColor: theme.color.card, borderRadius: theme.radius.md, padding: 18 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 12, color: theme.color.text, opacity: 0.7 }}>Total (Current Year)</Text>
            <Text style={{ fontSize: 28, fontWeight: '800', color: theme.color.pill, marginTop: 8 }}>${params.currentYearTotal.toLocaleString()}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 12, color: theme.color.text, opacity: 0.7 }}>Total (Previous Year)</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.color.text, marginTop: 8 }}>${(params.previousYearTotal ?? 0).toLocaleString()}</Text>
          </View>
        </View>

        {/* Difference badge */}
        {diffPct != null && (
          <View style={{ marginTop: 16 }}>
            <View style={{ alignSelf: 'flex-start', backgroundColor: isPositive ? '#ecfdf5' : '#ffebee', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 }}>
              <Text style={{ color: isPositive ? '#166534' : '#b91c1c', fontWeight: '700' }}>{isPositive ? `↑ ${Math.abs(diffPct)}% increase` : `↓ ${Math.abs(diffPct)}% decrease`}</Text>
            </View>
            <Text style={{ marginTop: 8, color: theme.color.text, opacity: 0.7 }}>Trend compared to previous year</Text>
          </View>
        )}

      </View>

      <View style={{ marginTop: 20 }}>
        <TouchableOpacity onPress={() => nav.goBack()} style={{ padding: 12, backgroundColor: theme.color.pill, borderRadius: theme.radius.md }}>
          <Text style={{ color: theme.color.text1, fontWeight: '700', textAlign: 'center' }}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
