import React from 'react';
import { StyleSheet, TouchableOpacity, FlatList, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface CategoryBreakdownProps {
  categories: any[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

export function CategoryBreakdown({ 
  categories, 
  selectedCategory, 
  onCategorySelect 
}: CategoryBreakdownProps) {
  const theme = useColorScheme() ?? 'light';

  const formatAmount = (amount: number) => {
    if (amount >= 1000000000) {
      return `LKR ${(amount / 1000000000).toFixed(1)}B`;
    }
    return `LKR ${(amount / 1000000).toFixed(0)}M`;
  };

  const getRandomTrend = () => Math.random() > 0.5 ? 'up' : 'down';
  const getRandomPercentage = () => (Math.random() * 20 + 5).toFixed(1);

  const renderCategoryItem = ({ item, index }: { item: any; index: number }) => {
    const isSelected = selectedCategory === item.name;
    const trend = getRandomTrend();
    const percentage = getRandomPercentage();

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 50)}
        style={styles.categoryItemContainer}
      >
        <TouchableOpacity
          style={[
            styles.categoryItem,
            isSelected && styles.selectedCategoryItem
          ]}
          onPress={() => onCategorySelect(isSelected ? null : item.name)}
          activeOpacity={0.8}
        >
          {/* Left side */}
          <View style={styles.categoryLeft}>
            <View style={[
              styles.categoryIndicator,
              { backgroundColor: item.color || Colors.light.tint }
            ]} />
            <View style={styles.categoryInfo}>
              <ThemedText type="defaultSemiBold" style={isSelected && styles.selectedCategoryName}>
                {item.name}
              </ThemedText>
              <ThemedText type="default">
                {item.description || `${item.name} sector allocation`}
              </ThemedText>
            </View>
          </View>

          {/* Right side */}
          <View style={styles.categoryRight}>
            <ThemedText type="defaultSemiBold" style={isSelected && styles.selectedCategoryAmount}>
              {formatAmount(item.amount)}
            </ThemedText>
            <View style={styles.trendContainer}>
              {trend === 'up' ? (
                <TrendingUp size={12} color="#059669" />
              ) : (
                <TrendingDown size={12} color="#dc2626" />
              )}
              <ThemedText 
                style={{ color: trend === 'up' ? '#059669' : '#dc2626' }}
              >
                {percentage}%
              </ThemedText>
            </View>
            <ChevronRight 
              size={16} 
              color={isSelected ? Colors[theme].tint : Colors[theme].icon} 
            />
          </View>
        </TouchableOpacity>

        {/* Subcategories */}
        {isSelected && (
          <Animated.View 
            style={styles.subcategoriesContainer}
            entering={FadeInUp.duration(300)}
          >
            <ThemedText type="defaultSemiBold">Subcategories</ThemedText>
            {item.subcategories?.length ? (
              item.subcategories.map((sub: any, subIndex: number) => (
                <View key={subIndex} style={styles.subcategoryItem}>
                  <ThemedText>{sub.name}</ThemedText>
                  <ThemedText>{formatAmount(sub.amount)}</ThemedText>
                </View>
              ))
            ) : (
              <ThemedText>No detailed breakdown available</ThemedText>
            )}
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Category Breakdown</ThemedText>
      <ThemedText type="subtitle">
        Tap any category to see detailed allocation
      </ThemedText>
      
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.name}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  list: {
    marginTop: 12,
  },
  categoryItemContainer: {
    marginBottom: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  selectedCategoryItem: {
    backgroundColor: '#e0f2fe', // <- light highlight, you can also darken it if you want
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIndicator: {
    width: 8,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
  },
  categoryInfo: {
    flexShrink: 1,
  },
  categoryRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  selectedCategoryName: {
    color: '#16423C', // 🔹 replaced blue with your custom color
  },
  selectedCategoryAmount: {
    color: '#16423C', // 🔹 replaced blue with your custom color
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subcategoriesContainer: {
    marginTop: 8,
    paddingLeft: 20,
  },
  subcategoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
});


