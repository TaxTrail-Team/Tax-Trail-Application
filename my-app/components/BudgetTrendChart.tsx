// my-app\components\BudgetTrendChart.tsx
import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;
const CONTAINER_PADDING = 16;
const Y_LABEL_OFFSET = 30;

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  decimalPlaces: 0,
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: "#4BC0C0",
  },
  propsForBackgroundLines: {
    strokeDasharray: "",
    stroke: "#F0F0F0",
    strokeWidth: 1,
  },
  propsForVerticalLabels: {
    fontSize: 10,
  },
  propsForHorizontalLabels: {
    fontSize: 10,
  },
};

interface Prediction {
  nextYear: number;
  nextYearPrediction: number;
  summary: string;
  confidence: number;
}

interface BudgetData {
  year: number;
  amount: number;
}

interface ChartDataPoint {
  data: number[];
  color: () => string;
  strokeWidth: number;
  strokeDashArray?: number[];
  withDots?: boolean;
}

type ChartDataValue = number | null;

export default function BudgetTrendChart({
  data,
  prediction,
  sector,
}: {
  data: BudgetData[];
  prediction?: Prediction;
  sector?: string;
}) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No budget data available.</Text>
      </View>
    );
  }

  // // Calculate next year for prediction (always do this for consistent logic)
  // const nextYear = Math.max(...data.map((d) => d.year)) + 1;

  // // Prepare labels - include prediction year only if prediction exists
  // const allYears = [...data.map((d) => d.year.toString())];
  // if (prediction) {
  //   allYears.push(nextYear.toString());
  // }
  // Smarter year handling
  const historicalYears = data.map((d) => d.year);
  const nextYear = prediction
    ? prediction.nextYear
    : Math.max(...historicalYears) + 1;

  const allYears = [...historicalYears.map((y) => y.toString())];
  if (prediction) {
    if (!allYears.includes(nextYear.toString()))
      allYears.push(nextYear.toString());
  }

  // Prepare datasets
  const N = data.length;
  const lastHistoricalAmount = data[N - 1]?.amount ?? null;
  let historicalData: ChartDataValue[] = data.map((d) => d.amount);
  let predictionData: ChartDataValue[] = [];

  // 1. Historical Line Padding
  if (prediction) {
    historicalData = [...historicalData, null];
  }

  // 2. Prediction Line Construction (Single Segment)
  if (
    prediction &&
    lastHistoricalAmount !== null &&
    lastHistoricalAmount !== undefined
  ) {
    const nullPadding = Array(N - 1).fill(null);

    predictionData = [
      ...nullPadding,
      lastHistoricalAmount,
      prediction.nextYearPrediction,
    ];
  } else {
    // If last historical amount is not available, fallback to empty prediction data
    predictionData = [];
  }

  const historicalDots: ChartDataValue[] = prediction
    ? [...data.map((d) => d.amount), null]
    : historicalData; // Use the main data if no prediction

  const chartData = {
    labels: allYears,
    datasets: [
      {
        data: historicalData,
        color: () => "rgba(75, 192, 192, 1)",
        strokeWidth: 2,
        withDots: false,
      } as ChartDataPoint,
      ...(predictionData.length > 0
        ? [
            {
              data: predictionData,
              color: () => "rgba(255, 165, 0, 1)",
              strokeWidth: 2,
              strokeDashArray: [6, 3],
              withDots: false,
            } as ChartDataPoint,
          ]
        : []),
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {sector ? `${sector} Budget Trend (LKR)` : "Budget Trend (LKR)"}
      </Text>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#4BC0C0" }]} />
          <Text style={styles.legendText}>Historical</Text>
        </View>
        {prediction && (
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: "#FFA500" }]}
            />
            <Text style={styles.legendText}>Predicted</Text>
          </View>
        )}
      </View>

      <LineChart
        data={chartData}
        width={screenWidth - CONTAINER_PADDING * 2 - Y_LABEL_OFFSET}
        height={250}
        chartConfig={chartConfig}
        bezier={false}
        withShadow={false}
        style={styles.chart}
        yLabelsOffset={Y_LABEL_OFFSET / 2}
        fromZero={true}
        yAxisSuffix=" LKR"
        withInnerLines={true}
        withOuterLines={true}
        segments={5}
        formatYLabel={(value) => {
          const num = parseInt(value);
          if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
          if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
          return value;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 16,
    paddingHorizontal: CONTAINER_PADDING,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4.65,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    paddingVertical: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
    alignSelf: "stretch",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
});
