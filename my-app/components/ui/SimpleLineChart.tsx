import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../theme';

interface DataPoint {
  month: string;
  value: number;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  height?: number;
}

export default function SimpleLineChart({ data, height = 200 }: SimpleLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  // Generate Y-axis labels (5 levels: 0, 25%, 50%, 75%, 100%)
  const yLabels = [0, maxValue * 0.25, maxValue * 0.5, maxValue * 0.75, maxValue];

  // Chart dimensions
  const chartHeight = height - 80; // Account for padding and x-axis
  const chartWidth = Dimensions.get('window').width - 100; // Account for y-axis and padding

  return (
    <View style={[styles.container, { height }]}>
      {/* Y-axis labels */}
      <View style={styles.yAxis}>
        {yLabels.map((label, index) => (
          <Text key={index} style={styles.yLabel}>
            {label >= 1000 ? `${(label / 1000).toFixed(0)}k` : Math.round(label).toString()}
          </Text>
        ))}
      </View>

      {/* Chart area */}
      <View style={styles.chartArea}>
        {/* Grid lines */}
        {yLabels.map((_, index) => (
          <View
            key={index}
            style={[
              styles.gridLine,
              { top: (index / (yLabels.length - 1)) * chartHeight + 30 }
            ]}
          />
        ))}

        {/* Data points and curve */}
        <View style={styles.dataContainer}>
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * (chartWidth - 60) + 30;
            const y = range > 0 
              ? ((maxValue - point.value) / range) * chartHeight + 30 
              : chartHeight / 2 + 30;
            
            return (
              <View key={index}>
                {/* Tooltip */}
                <View style={[styles.tooltip, { left: x - 25, top: y - 45 }]}>
                  <Text style={styles.tooltipText}>${point.value.toLocaleString()}</Text>
                </View>
                
                {/* Data point */}
                <View
                  style={[
                    styles.dataPoint,
                    { left: x - 4, top: y - 4 }
                  ]}
                />
              </View>
            );
          })}

          {/* Curve connecting points */}
          {data.slice(0, -1).map((_, index) => {
            const x1 = (index / (data.length - 1)) * (chartWidth - 60) + 30;
            const y1 = range > 0 
              ? ((maxValue - data[index].value) / range) * chartHeight + 30 
              : chartHeight / 2 + 30;
            const x2 = ((index + 1) / (data.length - 1)) * (chartWidth - 60) + 30;
            const y2 = range > 0 
              ? ((maxValue - data[index + 1].value) / range) * chartHeight + 30 
              : chartHeight / 2 + 30;
            
            const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
            const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            
            return (
              <View
                key={index}
                style={[
                  styles.curve,
                  {
                    left: x1,
                    top: y1,
                    width: distance,
                    transform: [{ rotate: `${angle}deg` }]
                  }
                ]}
              />
            );
          })}
        </View>

        {/* X-axis labels */}
        <View style={styles.xAxis}>
          {data.map((point, index) => (
            <Text key={index} style={styles.xLabel}>
              {point.month}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.color.card,
    borderRadius: theme.radius.md,
    padding: 16,
    marginVertical: 8,
    minHeight: 200,
  },
  yAxis: {
    width: 50,
    justifyContent: 'space-between',
    paddingVertical: 30,
  },
  yLabel: {
    fontSize: 12,
    color: theme.color.text,
    opacity: 0.7,
    textAlign: 'right',
    fontWeight: '500',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginLeft: 8,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: theme.color.border + '40',
  },
  dataContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 40,
  },
  curve: {
    position: 'absolute',
    height: 3,
    backgroundColor: theme.color.pill,
    opacity: 0.9,
    borderRadius: 1.5,
  },
  dataPoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.color.pill,
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.color.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    minWidth: 60,
    alignItems: 'center',
  },
  tooltipText: {
    fontSize: 11,
    color: theme.color.text,
    fontWeight: '700',
  },
  xAxis: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  xLabel: {
    fontSize: 12,
    color: theme.color.text,
    opacity: 0.7,
    fontWeight: '500',
  },
  noDataText: {
    fontSize: 14,
    color: theme.color.text,
    opacity: 0.5,
    textAlign: 'center',
    marginTop: 50,
  },
});
