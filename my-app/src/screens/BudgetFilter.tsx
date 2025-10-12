import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../../theme';
import Chip from '../../components/ui/Chip';
import { fetchCategories } from '../lib/api';
import { BudgetFilters, getBudgetFilters, setBudgetFilters, clearBudgetFilters } from '../lib/storage';

type RouteParams = {
  initial?: BudgetFilters;
};

export default function BudgetFilter() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const params: RouteParams = route?.params ?? {};

  const [years, setYears] = useState<number[]>(params.initial?.years ?? []);
  const [categories, setCategories] = useState<string[]>(params.initial?.categories ?? []);
  const [minAmount, setMinAmount] = useState<string>(params.initial?.minAmount?.toString?.() ?? '');
  const [maxAmount, setMaxAmount] = useState<string>(params.initial?.maxAmount?.toString?.() ?? '');
  const [allCats, setAllCats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate years from current year back to 2020
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 2019 }, (_, i) => currentYear - i);
  }, []);

  useEffect(() => {
    let mounted = true;
    
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch categories from API
        const fetchedCategories = await fetchCategories();
        if (mounted) {
          setAllCats(fetchedCategories || []);
        }

        // Load saved filters if no initial params
        if (!params.initial) {
          const saved = await getBudgetFilters();
          if (saved && mounted) {
            setYears(saved.years ?? []);
            setCategories(saved.categories ?? []);
            setMinAmount(saved.minAmount != null ? String(saved.minAmount) : '');
            setMaxAmount(saved.maxAmount != null ? String(saved.maxAmount) : '');
          }
        }
      } catch (err) {
        console.error('Error loading filter data:', err);
        if (mounted) {
          setError('Failed to load categories. Please try again.');
          // Fallback categories if API fails
          setAllCats(['Income', 'VAT', 'PAYE', 'Capital Gains', 'Other']);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();
    
    return () => {
      mounted = false;
    };
  }, [params.initial]);

  function toggle<T>(value: T, arr: T[], setArr: (v: T[]) => void) {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  }

  async function onApply() {
    try {
      const filters: BudgetFilters = {
        years: years.length > 0 ? years : undefined,
        categories: categories.length > 0 ? categories : undefined,
        minAmount: minAmount ? Number(minAmount) : undefined,
        maxAmount: maxAmount ? Number(maxAmount) : undefined,
      };
      
      await setBudgetFilters(filters);
      nav.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to save filters. Please try again.');
    }
  }

  async function onClear() {
    try {
      await clearBudgetFilters();
      setYears([]);
      setCategories([]);
      setMinAmount('');
      setMaxAmount('');
      nav.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to clear filters. Please try again.');
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.color.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.color.pill} />
        <Text style={{ marginTop: 16, color: theme.color.text, fontSize: 16 }}>Loading filters...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: theme.color.pill, marginBottom: 8 }}>
            Filters
          </Text>
          <Text style={{ fontSize: 16, color: theme.color.text, opacity: 0.7 }}>
            Customize your tax data view
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={{ 
            backgroundColor: '#fee2e2', 
            padding: 12, 
            borderRadius: theme.radius.md, 
            marginBottom: 20,
            borderLeftWidth: 4,
            borderLeftColor: theme.color.danger
          }}>
            <Text style={{ color: theme.color.danger, fontSize: 14, fontWeight: '600' }}>
              {error}
            </Text>
          </View>
        )}

        {/* Year Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.color.text, marginBottom: 12 }}>
            Year
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {yearOptions.map((y) => (
              <Chip 
                key={y} 
                label={String(y)} 
                selected={years.includes(y)} 
                onPress={() => toggle(y, years, setYears)} 
              />
            ))}
          </View>
        </View>

        {/* Categories Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.color.text, marginBottom: 12 }}>
            Categories
          </Text>
          {allCats.length === 0 ? (
            <View style={{ 
              backgroundColor: theme.color.card, 
              padding: 16, 
              borderRadius: theme.radius.md,
              alignItems: 'center'
            }}>
              <Text style={{ color: theme.color.text, opacity: 0.6 }}>
                No categories available
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {allCats.map((c) => (
                <Chip 
                  key={c} 
                  label={c} 
                  selected={categories.includes(c)} 
                  onPress={() => toggle(c, categories, setCategories)} 
                />
              ))}
            </View>
          )}
        </View>

        {/* Amount Range Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.color.text, marginBottom: 12 }}>
            Amount Range
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, color: theme.color.text, opacity: 0.7, marginBottom: 6 }}>
                Minimum
              </Text>
              <TextInput
                placeholder="0"
                value={minAmount}
                onChangeText={setMinAmount}
                keyboardType="numeric"
                style={{ 
                  backgroundColor: theme.color.card, 
                  padding: 14, 
                  borderRadius: theme.radius.md,
                  fontSize: 16,
                  color: theme.color.text,
                  borderWidth: 1,
                  borderColor: minAmount ? theme.color.brand : theme.color.border
                }}
                placeholderTextColor={theme.color.text + '80'}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, color: theme.color.text, opacity: 0.7, marginBottom: 6 }}>
                Maximum
              </Text>
              <TextInput
                placeholder="∞"
                value={maxAmount}
                onChangeText={setMaxAmount}
                keyboardType="numeric"
                style={{ 
                  backgroundColor: theme.color.card, 
                  padding: 14, 
                  borderRadius: theme.radius.md,
                  fontSize: 16,
                  color: theme.color.text,
                  borderWidth: 1,
                  borderColor: maxAmount ? theme.color.brand : theme.color.border
                }}
                placeholderTextColor={theme.color.text + '80'}
              />
            </View>
          </View>
        </View>

        {/* Active Filters Summary */}
        {(years.length > 0 || categories.length > 0 || minAmount || maxAmount) && (
          <View style={{ 
            backgroundColor: theme.color.brandSoft + '20', 
            padding: 16, 
            borderRadius: theme.radius.md, 
            marginBottom: 24,
            borderWidth: 1,
            borderColor: theme.color.brandSoft + '40'
          }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.color.brandSoft, marginBottom: 8 }}>
              Active Filters
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {years.length > 0 && (
                <View style={{ backgroundColor: theme.color.brandSoft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                    {years.length} year{years.length > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
              {categories.length > 0 && (
                <View style={{ backgroundColor: theme.color.brandSoft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                    {categories.length} categor{categories.length > 1 ? 'ies' : 'y'}
                  </Text>
                </View>
              )}
              {(minAmount || maxAmount) && (
                <View style={{ backgroundColor: theme.color.brandSoft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                    Amount range
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: theme.color.bg,
        padding: 20,
        paddingBottom: 34,
        borderTopWidth: 1,
        borderTopColor: theme.color.border + '40',
        flexDirection: 'row',
        gap: 12
      }}>
        <TouchableOpacity 
          onPress={() => nav.goBack()} 
          style={{ 
            backgroundColor: theme.color.card, 
            paddingVertical: 16, 
            borderRadius: theme.radius.md, 
            flex: 1,
            borderWidth: 1,
            borderColor: theme.color.border
          }}
        >
          <Text style={{ color: theme.color.text, textAlign: 'center', fontWeight: '700', fontSize: 16 }}>
            Close
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={onClear}
          style={{ 
            backgroundColor: theme.color.danger, 
            paddingVertical: 16, 
            borderRadius: theme.radius.md, 
            flex: 1,
            opacity: 0.9
          }}
        >
          <Text style={{ color: theme.color.text1, textAlign: 'center', fontWeight: '700', fontSize: 16 }}>
            Clear All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={onApply} 
          style={{ 
            backgroundColor: theme.color.pill, 
            paddingVertical: 16, 
            borderRadius: theme.radius.md, 
            flex: 1,
            shadowColor: theme.color.pill,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5
          }}
        >
          <Text style={{ color: theme.color.text1, textAlign: 'center', fontWeight: '700', fontSize: 16 }}>
            Apply Filters
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


