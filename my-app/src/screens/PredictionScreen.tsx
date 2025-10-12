// my-app\src\screens\PredictionScreen.tsx
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { Picker } from '@react-native-picker/picker';
import BudgetTrendChart from "../../components/BudgetTrendChart";
import data from "../../data/budgets.json";
import { SERVER } from "../lib/api";
import { useBudgetPrediction } from "../../hooks/useBudgetPrediction";
import { useNavigation } from "@react-navigation/native";
import { PredictionScreenNavigationProp } from "../types/navigation";

// interface Props {
//   navigation: PredictionScreenNavigationProp;
// }

interface Prediction {
  nextYear: number;
  nextYearPrediction: number;
  summary: string;
  confidence: number;
}

export default function PredictionScreen() {
  const [sector, setSector] = useState<string | null>(null);
  const [startYear, setStartYear] = useState<number | null>(null);
  const [endYear, setEndYear] = useState<number | null>(null);
  const [filteredData, setFilteredData] = useState<any[]>([]);

  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hook for new LLM-based summary
  const { generateSummary } = useBudgetPrediction();
  const navigation = useNavigation<PredictionScreenNavigationProp>();

  // ---- Build dynamic options ----
  const sectors = useMemo(
    () => Array.from(new Set(data.map((d) => d.sector))),
    []
  );

  const availableYears = useMemo(() => {
    if (!sector) return [];
    const years = data.filter((d) => d.sector === sector).map((d) => d.year);
    return Array.from(new Set(years)).sort();
  }, [sector]);

  // ---- Filter data based on selections ----
  const handleApplyFilters = () => {
    if (!sector || !startYear || !endYear) {
      Alert.alert("Incomplete Selection", "Please select all options.");
      return;
    }
    const selected = data.filter(
      (d) => d.sector === sector && d.year >= startYear && d.year <= endYear
    );
    setFilteredData(selected);
    setPrediction(null); // reset previous prediction
  };

  // Handle prediction request
  const handlePredict = async () => {
    if (!filteredData.length) {
      Alert.alert("Missing Data", "Please select valid data first.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${SERVER}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const result: Prediction = await response.json();

      // Validate the response
      if (!result.nextYearPrediction || !result.summary) {
        throw new Error("Invalid response from server");
      }

      setPrediction(result);
    } catch (err: any) {
      console.error("Prediction failed:", err);
      setError(err.message || "Failed to get prediction");
      Alert.alert(
        "Prediction Error",
        "Failed to get prediction. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // NEW FEATURE: Generate AI Summary
  const handleGenerateSummary = async () => {
    if (!prediction) return Alert.alert("No prediction available yet");
    try {
      const summary = await generateSummary(prediction);
      navigation.navigate("SummaryScreen", { summary });
    } catch (error) {
      Alert.alert("Summary Error", "Failed to generate AI summary.");
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "#4CAF50";
    if (confidence >= 0.6) return "#FF9800";
    return "#F44336";
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Budget Predictions</Text>
      {/* <Text style={styles.subtitle}>
        Analyze historical trends and predict next year's budget
      </Text> */}
      <Text style={styles.subtitle}>Choose sector and period to analyze</Text>

      {/* Step 1: Select sector */}
      <View style={styles.selectorContainer}>
        <Text style={styles.label}>Select Sector:</Text>
        <Picker
          selectedValue={sector}
          onValueChange={(value) => {
            setSector(value);
            setStartYear(null);
            setEndYear(null);
            setFilteredData([]);
          }}
        >
          <Picker.Item label="-- Choose --" value={null} />
          {sectors.map((s) => (
            <Picker.Item key={s} label={s} value={s} />
          ))}
        </Picker>
      </View>

      {/* Step 2: Select start and end year */}
      {sector && (
        <>
          <View style={styles.selectorContainer}>
            <Text style={styles.label}>Start Year:</Text>
            <Picker
              selectedValue={startYear}
              onValueChange={(value) => setStartYear(value)}
            >
              <Picker.Item label="-- Select --" value={null} />
              {availableYears.map((y) => (
                <Picker.Item key={y} label={y.toString()} value={y} />
              ))}
            </Picker>
          </View>

          <View style={styles.selectorContainer}>
            <Text style={styles.label}>End Year:</Text>
            <Picker
              selectedValue={endYear}
              onValueChange={(value) => setEndYear(value)}
            >
              <Picker.Item label="-- Select --" value={null} />
              {availableYears
                .filter((y) => !startYear || y >= startYear)
                .map((y) => (
                  <Picker.Item key={y} label={y.toString()} value={y} />
                ))}
            </Picker>
          </View>

          <Button title="Apply Filters" onPress={handleApplyFilters} />
        </>
      )}

      {/* Step 3: Show chart */}
      {filteredData.length > 0 && (
        <>
          <BudgetTrendChart data={filteredData || []} prediction={prediction || undefined} sector={sector || undefined} />

          <View style={styles.buttonContainer}>
            <Button
              title="Predict Next Year"
              onPress={handlePredict}
              disabled={loading}
              color="#4BC0C0"
            />
          </View>
        </>
      )}

      {prediction && (
        // <View style={styles.aiSummaryButton}>
        <View style={styles.predictionContainer}>
          <Text style={styles.predictionTitle}>
            {prediction.nextYear} {sector} Budget Prediction
          </Text>
          <Text style={styles.amountText}>
            {prediction.nextYearPrediction.toLocaleString()} LKR
          </Text>
          <Text style={styles.summaryText}>{prediction.summary}</Text>
          <Button
            title="Generate AI Summary"
            onPress={handleGenerateSummary}
            color="#FF9800"
          />
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4BC0C0" />
          <Text style={styles.loadingText}>Analyzing trends...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {prediction && (
        <View style={styles.predictionContainer}>
          <Text style={styles.predictionTitle}>
            {prediction.nextYear} Budget Prediction
          </Text>

          <View style={styles.predictionAmount}>
            <Text style={styles.amountText}>
              {prediction.nextYearPrediction.toLocaleString()} LKR
            </Text>
          </View>

          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Confidence: </Text>
            <View
              style={[
                styles.confidenceBadge,
                { backgroundColor: getConfidenceColor(prediction.confidence) },
              ]}
            >
              <Text style={styles.confidenceText}>
                {(prediction.confidence * 100).toFixed(1)}%
              </Text>
            </View>
          </View>

          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Analysis:</Text>
            <Text style={styles.summaryText}>{prediction.summary}</Text>
          </View>

          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Historical Data (2019-2023):</Text>
            <Text style={styles.statsText}>
              Average:{" "}
              {Math.round(
                data.reduce((sum, item) => sum + item.amount, 0) / data.length
              ).toLocaleString()}{" "}
              LKR
            </Text>
            <Text style={styles.statsText}>
              Total Growth:{" "}
              {(
                ((data[data.length - 1].amount - data[0].amount) /
                  data[0].amount) *
                100
              ).toFixed(1)}
              %
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#2c3e50",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    color: "#7f8c8d",
  },
  buttonContainer: {
    marginVertical: 20,
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#4BC0C0",
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  errorText: {
    color: "#c62828",
    textAlign: "center",
  },
  predictionContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginTop: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  predictionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#2c3e50",
  },
  predictionAmount: {
    backgroundColor: "#fff3e0",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  amountText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#e65100",
  },
  confidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  confidenceLabel: {
    fontSize: 16,
    color: "#666",
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  summaryContainer: {
    marginBottom: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#2c3e50",
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#555",
    fontStyle: "italic",
  },
  statsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#ecf0f1",
    paddingTop: 15,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: "#2c3e50",
  },
  statsText: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 2,
  },
  aiSummaryButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  selectorContainer: {
    marginVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    elevation: 2,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#2c3e50",
  },
});
