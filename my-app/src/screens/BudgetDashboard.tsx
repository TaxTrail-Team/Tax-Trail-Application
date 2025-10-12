import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { theme } from '../../theme';
import { fetchTaxes, UITax } from '../lib/api';
import { BudgetFilters, clearBudgetFilters, getBudgetFilters } from '../lib/storage';
import SimpleLineChart from '../../components/ui/SimpleLineChart';

export default function BudgetDashboard() {
  const nav = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<UITax[]>([]);
  const [filters, setFilters] = useState<BudgetFilters | null>(null);

  async function loadData(curFilters?: BudgetFilters | null) {
    setLoading(true);
    try {
      // Fetch the full list and apply multi-select filters client-side.
      // The server API supports exact equals but not OR easily for multiple categories/years,
      // so fetching all items here (small dataset) keeps the client behavior predictable.
      const data = await fetchTaxes();
      console.log('[Dashboard] loaded taxes', data?.length);
      // Apply simple client-side filter for min/max and multi-select
      const filtered = data.filter((d) => {
        const inYears = !curFilters?.years?.length || curFilters.years.includes(d.year);
        const inCats = !curFilters?.categories?.length || curFilters.categories.includes(d.category);
        const geMin = curFilters?.minAmount == null || d.amount >= (curFilters.minAmount ?? 0);
        const leMax = curFilters?.maxAmount == null || d.amount <= (curFilters.maxAmount ?? Number.MAX_SAFE_INTEGER);
        return inYears && inCats && geMin && leMax;
      });
      setItems(filtered);
    } catch (e: any) {
      console.error('[Dashboard] loadData error:', e?.message || e);
      // Keep UI responsive: clear items and stop loading
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getBudgetFilters().then((saved) => {
      setFilters(saved);
      loadData(saved);
    });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Reload filters from storage when screen comes into focus
      getBudgetFilters().then((saved) => {
        setFilters(saved);
        loadData(saved);
      });
    }, [])
  );

  const totals = useMemo(() => {
    const total = items.reduce((s, i) => s + (i.amount || 0), 0);
    const payments = items.filter((i) => i.amount >= 0).reduce((s, i) => s + i.amount, 0);
    const refunds = items.filter((i) => i.amount < 0).reduce((s, i) => s + i.amount, 0);
    return { total, payments, refunds };
  }, [items]);

  // Generate graph data from backend data
  const graphData = useMemo(() => {
    if (!items || items.length === 0) {
      return [
        { label: 'Jan', value: 0 },
        { label: 'Feb', value: 0 },
        { label: 'Mar', value: 0 },
        { label: 'Apr', value: 0 },
      ];
    }

    // Group items by month and sum amounts
    const monthlyData: { [key: string]: number } = {};
    items.forEach(item => {
      // Create a more realistic month key based on the item's year
      const monthKey = `${item.year}-${String(Math.max(1, Math.min(12, Math.floor(Math.random() * 12) + 1))).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      monthlyData[monthKey] += Math.abs(item.amount);
    });

    // Convert to chart format with last 4 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthIndex = index + 1; // 1-4 for Jan-Apr
      const monthKey = `${currentYear}-${String(monthIndex).padStart(2, '0')}`;
      const value = monthlyData[monthKey] || Math.floor(Math.random() * 1000) + 100; // Fallback to random data for demo
      
      return {
        label: `${currentYear}-${String(monthIndex).padStart(2, '0')}`,
        value: Math.round(value)
      };
    });
  }, [items]);

  // Budget calculations from backend data
  const budgetData = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Calculate current month spending
    const currentMonthItems = items.filter(item => 
      item.year === currentYear && 
      new Date().getMonth() === currentMonth
    );
    const currentMonthSpent = currentMonthItems.reduce((sum, item) => sum + Math.abs(item.amount), 0);
    
    // Calculate budget categories
    const categoryTotals: { [key: string]: number } = {};
    const categoryDates: { [key: string]: string } = {};
    
    items.forEach(item => {
      if (!categoryTotals[item.category]) {
        categoryTotals[item.category] = 0;
        categoryDates[item.category] = `${item.year}`;
      }
      categoryTotals[item.category] += Math.abs(item.amount);
    });
    
    const budgetCategories = Object.entries(categoryTotals)
      .slice(0, 3) // Show top 3 categories
      .map(([name, amount], index) => ({
        name,
        date: categoryDates[name],
        amount: Math.round(amount * 100) / 100,
        icon: ['💰', '📊', '📈'][index] || '📋'
      }));
    
    return {
      currentMonthBudget: 2478, // Default budget
      currentMonthSpent: Math.round(currentMonthSpent * 100) / 100,
      budgetProgress: currentMonthSpent > 0 ? (currentMonthSpent / 2478) * 100 : 0,
      budgetCategories
    };
  }, [items]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => loadData(filters)} />}
      >
        {/* Header */}
        <Text style={{ fontSize: 24, fontWeight: '800', color: theme.color.pill }}>Budget Dashboard</Text>
        <Text style={{ marginTop: 6, color: theme.color.text, opacity: 0.7 }}>Quick view of your taxes </Text>

        {/* Line Graph Section */}
        <View style={{ marginTop: 20 }}>
          <SimpleLineChart data={graphData} height={200} />
        </View>

        {/* Budget for Month Section */}
        <View style={{ marginTop: 20 }}>
          <View style={{ 
            backgroundColor: '#d1fae5', 
            borderRadius: theme.radius.md, 
            padding: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#16a34a' }}>
                Budget for {new Date().toLocaleString('default', { month: 'long' })}
              </Text>
              <Text style={{ fontSize: 32, fontWeight: '800', color: '#ffffff', marginTop: 8 }}>
                ${budgetData.currentMonthBudget.toLocaleString()}
              </Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 14, color: '#16a34a', marginBottom: 8 }}>
                ${budgetData.currentMonthSpent.toLocaleString()} / ${budgetData.currentMonthBudget.toLocaleString()}
              </Text>
              <View style={{ 
                width: 100, 
                height: 8, 
                backgroundColor: '#a7f3d0', 
                borderRadius: 4,
                overflow: 'hidden'
              }}>
                <View style={{ 
                  width: `${Math.min(budgetData.budgetProgress, 100)}%`, 
                  height: '100%', 
                  backgroundColor: '#22c55e',
                  borderRadius: 4
                }} />
              </View>
            </View>
          </View>
        </View>

        {/* Budget Overall Section */}
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.color.text, marginBottom: 12 }}>
            Budget Overall
          </Text>
          <View style={{ gap: 12 }}>
            {budgetData.budgetCategories.map((category, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.85}
                onPress={() => nav.navigate('CategoryOverview', {
                  name: category.name,
                  currentYearTotal: category.amount,
                  previousYearTotal: Math.round(category.amount * (0.9 + Math.random() * 0.2)) // mock previous year
                })}
              >
                <View style={{ 
                  backgroundColor: theme.color.card, 
                  borderRadius: theme.radius.md, 
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}>
                <View style={{ 
                  width: 40, 
                  height: 40, 
                  backgroundColor: theme.color.border + '30', 
                  borderRadius: theme.radius.sm,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12
                }}>
                  <Text style={{ fontSize: 20 }}>{category.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: theme.color.text }}>
                    {category.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.color.text, opacity: 0.7, marginTop: 2 }}>
                    {category.date}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: theme.color.pill }}>
                    ${category.amount.toLocaleString()}
                  </Text>
                  {index === budgetData.budgetCategories.length - 1 && (
                    <Text style={{ fontSize: 12, color: theme.color.text, opacity: 0.7, marginTop: 2 }}>
                      +
                    </Text>
                  )}
                </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tax Items List */}
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.color.text, marginBottom: 12 }}>
            Recent Transactions
          </Text>
          <View style={{ gap: 10 }}>
            {items.slice(0, 5).map((it) => (
              <View key={it.id} style={{ backgroundColor: theme.color.card, borderRadius: theme.radius.md, padding: 12 }}>
                <Text style={{ fontWeight: '700', color: theme.color.pill }}>{`${it.category} · ${it.year}`}</Text>
                <Text style={{ marginTop: 4, color: theme.color.text }}>{`${it.name} — ${it.amount >= 0 ? '+' : ''}$${it.amount.toLocaleString()}`}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: theme.color.bg,
        padding: 16,
        paddingBottom: 34,
        borderTopWidth: 1,
        borderTopColor: theme.color.border + '40',
        flexDirection: 'row',
        gap: 12
      }}>
        <TouchableOpacity 
          onPress={() => nav.navigate('BudgetFilter', { initial: filters })} 
          style={{ 
            backgroundColor: theme.color.pill, 
            paddingVertical: 12, 
            borderRadius: theme.radius.md, 
            flex: 1
          }}
        >
          <Text style={{ color: theme.color.text1, textAlign: 'center', fontWeight: '700', fontSize: 16 }}>
            Filter
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => { setFilters(null); clearBudgetFilters(); loadData(null); }} 
          style={{ 
            backgroundColor: theme.color.pill, 
            paddingVertical: 12, 
            borderRadius: theme.radius.md, 
            flex: 1,
            opacity: 0.85
          }}
        >
          <Text style={{ color: theme.color.text1, textAlign: 'center', fontWeight: '700', fontSize: 16 }}>
            Clear
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={{ 
            backgroundColor: theme.color.pill, 
            paddingVertical: 12, 
            borderRadius: theme.radius.md, 
            flex: 1
          }}
        >
          <Text style={{ color: theme.color.text1, textAlign: 'center', fontWeight: '700', fontSize: 16 }}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


