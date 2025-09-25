import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChartPie as PieChart, TrendingUp, TrendingDown } from 'lucide-react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';

interface BudgetOverviewProps {
  data: any;
  loading: boolean;
}

export function BudgetOverview({ data, loading }: BudgetOverviewProps) {
  if (loading || !data) {
    return (
      <View style={styles.container}>
        <View style={[styles.card, styles.loadingCard]}>
          <Text style={styles.loadingText}>Loading budget data...</Text>
        </View>
      </View>
    );
  }

  const statsCards = [
    {
      title: 'Education',
      amount: data.education || 0,
      percentage: 18.5,
      trend: 'up',
      color: '#3b82f6',
    },
    {
      title: 'Healthcare',
      amount: data.healthcare || 0,
      percentage: 15.2,
      trend: 'up',
      color: '#059669',
    },
    {
      title: 'Defense',
      amount: data.defense || 0,
      percentage: 22.8,
      trend: 'down',
      color: '#dc2626',
    },
    {
      title: 'Infrastructure',
      amount: data.infrastructure || 0,
      percentage: 12.1,
      trend: 'up',
      color: '#7c3aed',
    },
  ];

  const formatAmount = (amount: number) => {
    return `LKR ${(amount / 1000000).toFixed(0)}M`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <PieChart size={24} color="#1f2937" />
        <Text style={styles.sectionTitle}>Key Allocations</Text>
      </View>
      
      <View style={styles.cardsContainer}>
        {statsCards.map((card, index) => (
          <Animated.View
            key={card.title}
            style={[styles.card, { borderLeftColor: card.color }]}
            entering={FadeInLeft.delay(index * 100)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <View style={styles.trendContainer}>
                {card.trend === 'up' ? (
                  <TrendingUp size={16} color="#059669" />
                ) : (
                  <TrendingDown size={16} color="#dc2626" />
                )}
                <Text 
                  style={[
                    styles.trendText,
                    { color: card.trend === 'up' ? '#059669' : '#dc2626' }
                  ]}
                >
                  {card.percentage}%
                </Text>
              </View>
            </View>
            
            <Text style={styles.cardAmount}>
              {formatAmount(card.amount)}
            </Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  cardsContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  loadingCard: {
    borderLeftColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
});