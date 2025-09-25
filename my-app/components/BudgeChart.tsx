import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';
import { ChartBar as BarChart3, ChartPie as PieIcon, TrendingUp } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const chartWidth = width - 40;

interface BudgetChartProps {
  data: any[];
  type: 'pie' | 'bar' | 'line';
  onTypeChange: (type: 'pie' | 'bar' | 'line') => void;
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

export function BudgetChart({ 
  data, 
  type, 
  onTypeChange, 
  selectedCategory,
  onCategorySelect 
}: BudgetChartProps) {
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  const pieColors = [
    '#3b82f6', '#059669', '#dc2626', '#7c3aed', 
    '#ea580c', '#0891b2', '#be185d', '#059669'
  ];

  const pieData = data.map((item, index) => ({
    name: item.name,
    amount: item.amount,
    color: pieColors[index % pieColors.length],
    legendFontColor: '#1f2937',
    legendFontSize: 12,
  }));

  const barData = {
    labels: data.map(item => item.name.substring(0, 8)),
    datasets: [{
      data: data.map(item => item.amount / 1000000),
    }],
  };

  const lineData = {
    labels: ['2020', '2021', '2022', '2023', '2024'],
    datasets: [{
      data: [1200, 1350, 1100, 1450, 1600],
      strokeWidth: 3,
    }],
  };

  const chartTypes = [
    { key: 'pie', icon: PieIcon, label: 'Pie' },
    { key: 'bar', icon: BarChart3, label: 'Bar' },
    { key: 'line', icon: TrendingUp, label: 'Trend' },
  ];

  const renderChart = () => {
    switch (type) {
      case 'pie':
        return (
          <PieChart
            data={pieData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 10]}
            absolute
          />
        );
      case 'bar':
        return (
          <BarChart
            data={barData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            showValuesOnTopOfBars
            fromZero
          />
        );
      case 'line':
        return (
          <LineChart
            data={lineData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget Visualization</Text>
        <View style={styles.chartTypeSelector}>
          {chartTypes.map(({ key, icon: Icon, label }) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.typeButton,
                type === key && styles.activeTypeButton
              ]}
              onPress={() => onTypeChange(key as any)}
            >
              <Icon 
                size={16} 
                color={type === key ? '#ffffff' : '#6b7280'} 
              />
              <Text style={[
                styles.typeButtonText,
                type === key && styles.activeTypeButtonText
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Animated.View 
        style={styles.chartContainer}
        key={type}
        entering={FadeIn.duration(400)}
      >
        {renderChart()}
      </Animated.View>

      <Text style={styles.chartNote}>
        {type === 'line' 
          ? 'Historical budget trends over the past 5 years'
          : type === 'bar'
          ? 'Budget allocation by sector (in millions LKR)'
          : 'Percentage distribution of budget allocation'
        }
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  chartTypeSelector: {
    flexDirection: 'row',
    gap: 4,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    gap: 4,
  },
  activeTypeButton: {
    backgroundColor: '#2563eb',
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#16423C',
  },
  activeTypeButtonText: {
    color: '#ffffff',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  chartNote: {
    fontSize: 12,
    color: '#16423C',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
});