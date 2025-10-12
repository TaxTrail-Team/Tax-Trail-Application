import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Dimensions,
  Share,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { LineChart, BarChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { fetchTaxes, fetchCategories, fetchYears, UITax, fetchAIAnomalyInsights, AIAnomalyInsights, fetchExecutiveSummary } from "../lib/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Chip from "../../components/ui/Chip";
import { theme } from "../../theme";

const screenWidth = Dimensions.get("window").width;

// Shimmer Loading Component
const ShimmerPlaceholder = ({ width = "100%", height = 20, style = {} }: any) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-screenWidth, screenWidth],
  });

  return (
    <View
      style={[
        {
          width,
          height,
          backgroundColor: "#e1e9ee",
          borderRadius: 8,
          overflow: "hidden",
        },
        style,
      ]}
    >
     
export default function Anomaly() {
  const [taxes, setTaxes] = useState<UITax[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [minYear, setMinYear] = useState<number | undefined>(undefined);
  const [maxYear, setMaxYear] = useState<number | undefined>(undefined);
  const [deviationThreshold, setDeviationThreshold] = useState(50); // percentage

  // Display mode
  const [displayMode, setDisplayMode] = useState<"absolute" | "percent">("absolute");
  
  // Chart and drill-down state
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [drillDownYear, setDrillDownYear] = useState<number | null>(null);
  const [drillDownItems, setDrillDownItems] = useState<UITax[]>([]);
  const [exporting, setExporting] = useState(false);

  // AI Insights state
  const [aiInsights, setAiInsights] = useState<AIAnomalyInsights | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [executiveSummary, setExecutiveSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const fmt = useMemo(
    () => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }),
    []
  );

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for stats
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Load initial data
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchCategories(),
      fetchYears(),
      fetchTaxes(),
    ])
      .then(([cats, yrs, txs]) => {
        setCategories(cats);
        setYears(yrs.sort((a, b) => b - a));
        setTaxes(txs);
        if (yrs.length >= 2) {
          setMinYear(Math.min(...yrs));
          setMaxYear(Math.max(...yrs));
        }
      })
      .catch((e) => setErrorMsg(e?.message || "Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  // Filtered taxes based on category and year range
  const filteredTaxes = useMemo(() => {
    return taxes.filter((t) => {
      if (selectedCategory && t.category !== selectedCategory) return false;
      if (selectedYear && t.year !== selectedYear) return false;
      if (minYear && t.year < minYear) return false;
      if (maxYear && t.year > maxYear) return false;
      return true;
    });
  }, [taxes, selectedCategory, selectedYear, minYear, maxYear]);

  // Calculate yearly totals and statistics
  const yearlyData = useMemo(() => {
    const yearMap = new Map<number, { total: number; count: number }>();

    filteredTaxes.forEach((tax) => {
      const existing = yearMap.get(tax.year) || { total: 0, count: 0 };
      yearMap.set(tax.year, {
        total: existing.total + tax.amount,
        count: existing.count + 1,
      });
    });

    const yearTotals = Array.from(yearMap.entries())
      .map(([year, data]) => ({ year, ...data }))
      .sort((a, b) => b.year - a.year);

    // Calculate mean
    const mean =
      yearTotals.length > 0
        ? yearTotals.reduce((sum, y) => sum + y.total, 0) / yearTotals.length
        : 0;

    // Calculate standard deviation
    const variance =
      yearTotals.length > 0
        ? yearTotals.reduce((sum, y) => sum + Math.pow(y.total - mean, 2), 0) /
          yearTotals.length
        : 0;
    const stdDev = Math.sqrt(variance);

    // Add deviation and anomaly detection
    const withStats: YearData[] = yearTotals.map((y, idx) => {
      const percentChange =
        idx < yearTotals.length - 1
          ? ((y.total - yearTotals[idx + 1].total) / yearTotals[idx + 1].total) * 100
          : 0;

      const deviation = mean !== 0 ? ((y.total - mean) / mean) * 100 : 0;

      return {
        ...y,
        percentChange,
        deviation,
        isHighAnomaly: deviation >= deviationThreshold,
        isLowAnomaly: deviation <= -deviationThreshold,
      };
    });

    return { data: withStats, mean, stdDev };
  }, [filteredTaxes, deviationThreshold]);

  // Top 3 anomalies
  const topAnomalies = useMemo((): TopAnomaly[] => {
    const anomalies = yearlyData.data.filter(
      (y) => y.isHighAnomaly || y.isLowAnomaly
    );

    const sorted = [...anomalies].sort(
      (a, b) => Math.abs(b.deviation) - Math.abs(a.deviation)
    );

    return sorted.slice(0, 3).map((y) => ({
      year: y.year,
      type: y.isHighAnomaly ? "high" : "low",
      title: y.isHighAnomaly ? "Peak Budget Overrun" : "Significant Underspend",
      description: `${Math.abs(y.deviation).toFixed(1)}% ${
        y.isHighAnomaly ? "above" : "below"
      } average. ${y.count} tax items recorded.`,
      deviation: y.deviation,
    }));
  }, [yearlyData.data]);

  // Average total with change
  const avgTotal = yearlyData.mean;
  const latestYear = yearlyData.data[0];
  const avgChange = latestYear ? latestYear.total - avgTotal : 0;

  // Drill-down handler
  const handleYearDrillDown = (year: number) => {
    const items = filteredTaxes.filter((t) => t.year === year);
    setDrillDownYear(year);
    setDrillDownItems(items);
  };

  // Export to CSV
  const exportToCSV = async () => {
    try {
      setExporting(true);

      // Create CSV content
      const headers = ["Year", "Total (LKR)", "Count", "% Change", "Deviation %", "Status"];
      const rows = yearlyData.data.map((y) => [
        y.year,
        y.total.toFixed(2),
        y.count,
        y.percentChange.toFixed(2),
        y.deviation.toFixed(2),
        y.isHighAnomaly ? "High Anomaly" : y.isLowAnomaly ? "Low Anomaly" : "Normal",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
        "",
        `Average Total,${avgTotal.toFixed(2)}`,
        `Deviation Threshold,${deviationThreshold}%`,
        `Category Filter,${selectedCategory || "All"}`,
      ].join("\n");

      // Save to file
      const fileName = `anomaly_report_${new Date().getTime()}.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Export Anomaly Report",
          UTI: "public.comma-separated-values-text",
        });
      } else {
        Alert.alert("Success", "Report exported successfully!");
      }
    } catch (error: any) {
      Alert.alert("Export Failed", error?.message || "Could not export data");
    } finally {
      setExporting(false);
    }
  };

  // Share simple summary
  const shareQuickSummary = async () => {
    try {
      const summary = [
        `📊 Anomaly Report`,
        ``,
        `Average: ${fmt.format(avgTotal)} LKR`,
        `Years Analyzed: ${yearlyData.data.length}`,
        `Threshold: ${deviationThreshold}%`,
        ``,
        `Top Anomalies:`,
        ...topAnomalies.map(
          (a, i) =>
            `${i + 1}. ${a.year} - ${a.title} (${a.deviation >= 0 ? "+" : ""}${a.deviation.toFixed(1)}%)`
        ),
      ].join("\n");

      await Share.share({
        message: summary,
        title: "Tax Anomaly Report",
      });
    } catch (error: any) {
      console.log("Share error:", error?.message);
    }
  };

  // Fetch AI Insights
  const getAIInsights = async () => {
    if (yearlyData.data.length === 0) {
      Alert.alert("No Data", "Please ensure you have data to analyze");
      return;
    }

    try {
      setLoadingAI(true);
      const insights = await fetchAIAnomalyInsights({
        yearlyData: yearlyData.data,
        mean: avgTotal,
        deviationThreshold,
        category: selectedCategory,
      });
      setAiInsights(insights);
      setShowAIInsights(true);
    } catch (error: any) {
      Alert.alert("AI Analysis Failed", error?.message || "Could not generate insights");
    } finally {
      setLoadingAI(false);
    }
  };

  // Generate Executive Summary
  const getExecutiveSummary = async () => {
    if (yearlyData.data.length === 0) {
      Alert.alert("No Data", "Please ensure you have data to analyze");
      return;
    }

    try {
      setLoadingSummary(true);
      const summary = await fetchExecutiveSummary({
        yearlyData: yearlyData.data,
        mean: avgTotal,
        topAnomalies: topAnomalies.map((a) => ({
          year: a.year,
          type: a.type,
          deviation: a.deviation,
        })),
        category: selectedCategory,
      });
      setExecutiveSummary(summary);
      // Share or display the summary
      await Share.share({
        message: summary,
        title: "Executive Summary - Anomaly Analysis",
      });
    } catch (error: any) {
      Alert.alert("Summary Failed", error?.message || "Could not generate summary");
    } finally {
      setLoadingSummary(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#22c55e", "#16a34a", "#15803d"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <MaterialCommunityIcons
                  name="chart-line-variant"
                  size={28}
                  color="#fff"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.title}>Anomaly Insights</Text>
              </View>
              <Text style={styles.subtitle}>Loading your data...</Text>
            </View>
          </View>
        </LinearGradient>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
          {/* Shimmer Loading Cards */}
          <View style={styles.shimmerCard}>
            <ShimmerPlaceholder width="40%" height={16} style={{ marginBottom: 12 }} />
            <ShimmerPlaceholder width="80%" height={40} style={{ marginBottom: 8 }} />
            <ShimmerPlaceholder width="60%" height={20} />
          </View>
          <View style={styles.shimmerCard}>
            <ShimmerPlaceholder width="50%" height={16} style={{ marginBottom: 12 }} />
            <ShimmerPlaceholder width="100%" height={120} />
          </View>
          <View style={styles.shimmerCard}>
            <ShimmerPlaceholder width="45%" height={16} style={{ marginBottom: 12 }} />
            <ShimmerPlaceholder width="100%" height={60} style={{ marginBottom: 8 }} />
            <ShimmerPlaceholder width="100%" height={60} style={{ marginBottom: 8 }} />
            <ShimmerPlaceholder width="100%" height={60} />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={["#22c55e", "#16a34a", "#15803d"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <MaterialCommunityIcons
                name="chart-line-variant"
                size={28}
                color="#fff"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.title}>Anomaly Insights</Text>
            </View>
            <Text style={styles.subtitle}>
              Detecting patterns {deviationThreshold}% from average
            </Text>
          </View>
          <TouchableOpacity style={styles.infoIcon}>
            <Ionicons name="information-circle" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={{ flex: 1, opacity: fadeAnim }}
        contentContainerStyle={styles.scrollContent}
      >
        {errorMsg ? (
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Card style={styles.errorCard}>
              <View style={styles.errorIconWrapper}>
                <LinearGradient
                  colors={["#ef4444", "#dc2626"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.errorIconGradient}
                >
                  <Ionicons name="alert-circle" size={32} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={styles.errorText}>{errorMsg}</Text>
              <Text style={styles.errorSubtext}>Please try refreshing the page</Text>
            </Card>
          </Animated.View>
        ) : null}

        {/* Quick Actions Bar - Unified */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.actionsBar}
          style={styles.actionsBarWrapper}
        >
          <TouchableOpacity
            style={[styles.actionButton, (exporting || yearlyData.data.length === 0) && styles.actionButtonDisabled]}
            onPress={exportToCSV}
            disabled={exporting || yearlyData.data.length === 0}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={["#3b82f6", "#2563eb"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="download-outline" size={22} color="#fff" />
              <Text style={styles.actionButtonText}>
                {exporting ? "Exporting..." : "Export"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, yearlyData.data.length === 0 && styles.actionButtonDisabled]}
            onPress={shareQuickSummary}
            disabled={yearlyData.data.length === 0}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={["#8b5cf6", "#7c3aed"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="share-social-outline" size={22} color="#fff" />
              <Text style={styles.actionButtonText}>Share</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, yearlyData.data.length === 0 && styles.actionButtonDisabled]}
            onPress={() => setShowChart(!showChart)}
            disabled={yearlyData.data.length === 0}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={showChart ? ["#f59e0b", "#d97706"] : ["#22c55e", "#16a34a"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionButtonGradient}
            >
              <MaterialCommunityIcons
                name={showChart ? "chart-line-variant" : "chart-bar"}
                size={22}
                color="#fff"
              />
              <Text style={styles.actionButtonText}>
                {showChart ? "Hide" : "Charts"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, (yearlyData.data.length === 0 || loadingAI) && styles.actionButtonDisabled]}
            onPress={getAIInsights}
            disabled={yearlyData.data.length === 0 || loadingAI}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={["#ec4899", "#db2777"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionButtonGradient}
            >
              <MaterialCommunityIcons
                name="brain"
                size={22}
                color="#fff"
              />
              <Text style={styles.actionButtonText}>
                {loadingAI ? "Analyzing..." : "AI Insights"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, (yearlyData.data.length === 0 || loadingSummary) && styles.actionButtonDisabled]}
            onPress={getExecutiveSummary}
            disabled={yearlyData.data.length === 0 || loadingSummary}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={["#f97316", "#ea580c"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionButtonGradient}
            >
              <Ionicons
                name="document-text"
                size={22}
                color="#fff"
              />
              <Text style={styles.actionButtonText}>
                {loadingSummary ? "Writing..." : "Summary"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>

        {/* Charts Section */}
        {showChart && yearlyData.data.length > 0 && (
          <Card>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionTitle}>Visual Analytics</Text>
              <View style={styles.chartToggle}>
                <Pressable
                  style={[
                    styles.chartToggleBtn,
                    chartType === "line" && styles.chartToggleBtnActive,
                  ]}
                  onPress={() => setChartType("line")}
                >
                  <Text
                    style={[
                      styles.chartToggleText,
                      chartType === "line" && styles.chartToggleTextActive,
                    ]}
                  >
                    Line
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.chartToggleBtn,
                    chartType === "bar" && styles.chartToggleBtnActive,
                  ]}
                  onPress={() => setChartType("bar")}
                >
                  <Text
                    style={[
                      styles.chartToggleText,
                      chartType === "bar" && styles.chartToggleTextActive,
                    ]}
                  >
                    Bar
                  </Text>
                </Pressable>
              </View>
            </View>

            {chartType === "line" ? (
              <LineChart
                data={{
                  labels: yearlyData.data
                    .slice()
                    .reverse()
                    .map((y) => String(y.year)),
                  datasets: [
                    {
                      data: yearlyData.data
                        .slice()
                        .reverse()
                        .map((y) => y.total / 1000), // Convert to thousands
                    },
                  ],
                }}
                width={screenWidth - theme.space.lg * 4}
                height={220}
                chartConfig={{
                  backgroundColor: theme.color.card,
                  backgroundGradientFrom: theme.color.card,
                  backgroundGradientTo: theme.color.card,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: theme.radius.md,
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: theme.color.brand,
                  },
                }}
                bezier
                style={{
                  marginVertical: theme.space.sm,
                  borderRadius: theme.radius.md,
                }}
              />
            ) : (
              <BarChart
                data={{
                  labels: yearlyData.data
                    .slice()
                    .reverse()
                    .map((y) => String(y.year)),
                  datasets: [
                    {
                      data: yearlyData.data
                        .slice()
                        .reverse()
                        .map((y) => y.total / 1000),
                    },
                  ],
                }}
                width={screenWidth - theme.space.lg * 4}
                height={220}
                yAxisLabel=""
                yAxisSuffix="K"
                chartConfig={{
                  backgroundColor: theme.color.card,
                  backgroundGradientFrom: theme.color.card,
                  backgroundGradientTo: theme.color.card,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: theme.radius.md,
                  },
                }}
                style={{
                  marginVertical: theme.space.sm,
                  borderRadius: theme.radius.md,
                }}
              />
            )}
            <Text style={styles.chartNote}>💡 Values shown in thousands (K) LKR</Text>
          </Card>
        )}

        {/* AI Insights Section */}
        {showAIInsights && aiInsights && (
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Card style={styles.aiInsightsCard}>
              <View style={styles.aiInsightsHeader}>
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <LinearGradient
                    colors={["#ec4899", "#db2777"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.aiIconBadge}
                  >
                    <MaterialCommunityIcons name="brain" size={24} color="#fff" />
                  </LinearGradient>
                  <View>
                    <Text style={styles.aiInsightsTitle}>AI-Powered Insights</Text>
                    <Text style={styles.aiInsightsSubtitle}>Generated by LangChain + Llama 3.3</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setShowAIInsights(false)}>
                  <Ionicons name="close-circle" size={28} color={theme.color.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Overall Trend */}
              <View style={styles.aiSection}>
                <View style={styles.aiSectionHeader}>
                  <MaterialCommunityIcons name="trending-up" size={20} color="#22c55e" />
                  <Text style={styles.aiSectionTitle}>Overall Trend</Text>
                </View>
                <Text style={styles.aiText}>{aiInsights.overallTrend}</Text>
              </View>

              {/* Prediction */}
              <LinearGradient
                colors={["#fef3c7", "#fde68a"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.predictionCard}
              >
                <View style={styles.predictionHeader}>
                  <MaterialCommunityIcons name="crystal-ball" size={24} color="#f59e0b" />
                  <Text style={styles.predictionTitle}>Next Year Prediction</Text>
                </View>
                <Text style={styles.predictionValue}>
                  {fmt.format(aiInsights.prediction.nextYear)} LKR
                </Text>
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>
                    Confidence: {aiInsights.prediction.confidence.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.predictionReasoning}>{aiInsights.prediction.reasoning}</Text>
              </LinearGradient>

              {/* Key Findings */}
              <View style={styles.aiSection}>
                <View style={styles.aiSectionHeader}>
                  <Ionicons name="bulb" size={20} color="#f59e0b" />
                  <Text style={styles.aiSectionTitle}>Key Findings</Text>
                </View>
                {aiInsights.keyFindings.map((finding, idx) => (
                  <View key={idx} style={styles.findingRow}>
                    <Text style={styles.findingBullet}>•</Text>
                    <Text style={styles.findingText}>{finding}</Text>
                  </View>
                ))}
              </View>

              {/* Risks & Opportunities */}
              <View style={styles.riskOppRow}>
                <View style={styles.riskOppCard}>
                  <View style={styles.riskOppHeader}>
                    <MaterialCommunityIcons name="alert-circle" size={18} color="#ef4444" />
                    <Text style={[styles.riskOppTitle, { color: "#ef4444" }]}>Risks</Text>
                  </View>
                  {aiInsights.risks.slice(0, 2).map((risk, idx) => (
                    <Text key={idx} style={styles.riskOppText}>• {risk}</Text>
                  ))}
                </View>
                <View style={styles.riskOppCard}>
                  <View style={styles.riskOppHeader}>
                    <MaterialCommunityIcons name="lightbulb-on" size={18} color="#22c55e" />
                    <Text style={[styles.riskOppTitle, { color: "#22c55e" }]}>Opportunities</Text>
                  </View>
                  {aiInsights.opportunities.slice(0, 2).map((opp, idx) => (
                    <Text key={idx} style={styles.riskOppText}>• {opp}</Text>
                  ))}
                </View>
              </View>

              {/* Year-specific Insights */}
              {aiInsights.insights.filter(i => i.year).slice(0, 3).map((insight) => (
                <View key={insight.year} style={styles.yearInsightCard}>
                  <View style={styles.yearInsightHeader}>
                    <Text style={styles.yearInsightYear}>{insight.year}</Text>
                    <View style={[
                      styles.severityBadge,
                      { backgroundColor: insight.severity === "high" ? "#fee2e2" : insight.severity === "medium" ? "#fef3c7" : "#dbeafe" }
                    ]}>
                      <Text style={[
                        styles.severityText,
                        { color: insight.severity === "high" ? "#dc2626" : insight.severity === "medium" ? "#f59e0b" : "#3b82f6" }
                      ]}>
                        {insight.severity.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.yearInsightExplanation}>{insight.explanation}</Text>
                  {insight.recommendedActions.length > 0 && (
                    <View style={styles.actionsSection}>
                      <Text style={styles.actionsTitle}>Recommended Actions:</Text>
                      {insight.recommendedActions.map((action, idx) => (
                        <Text key={idx} style={styles.actionText}>✓ {action}</Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </Card>
          </Animated.View>
        )}

        {/* Average Yearly Total Card - Enhanced with Animation */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Card style={styles.statsCard}>
            <View style={styles.statsIconWrapper}>
              <LinearGradient
                colors={["#22c55e", "#16a34a"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statsIconGradient}
              >
                <MaterialCommunityIcons name="chart-timeline-variant" size={32} color="#fff" />
              </LinearGradient>
            </View>
          <Text style={styles.cardLabel}>AVERAGE YEARLY TOTAL</Text>
          <View style={styles.avgTotalRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.avgTotalValue}>
                {fmt.format(avgTotal)}
              </Text>
              <Text style={styles.avgTotalCurrency}>LKR</Text>
              <View style={styles.changeRow}>
                <View style={[
                  styles.changeBadge,
                  { backgroundColor: avgChange >= 0 ? "#dcfce7" : "#fee2e2" }
                ]}>
                  <Ionicons
                    name={avgChange >= 0 ? "trending-up" : "trending-down"}
                    size={16}
                    color={avgChange >= 0 ? "#16a34a" : "#dc2626"}
                  />
                  <Text
                    style={[
                      styles.changeText,
                      { color: avgChange >= 0 ? "#16a34a" : "#dc2626" },
                    ]}
                  >
                    {fmt.format(Math.abs(avgChange))} vs latest
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.toggleContainer}>
            <Pressable
              style={[
                styles.toggleBtn,
                displayMode === "absolute" && styles.toggleBtnActive,
              ]}
              onPress={() => setDisplayMode("absolute")}
            >
              <Ionicons
                name="cash-outline"
                size={18}
                color={displayMode === "absolute" ? "#fff" : theme.color.textMuted}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.toggleText,
                  displayMode === "absolute" && styles.toggleTextActive,
                ]}
              >
                Absolute
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.toggleBtn,
                displayMode === "percent" && styles.toggleBtnActive,
              ]}
              onPress={() => setDisplayMode("percent")}
            >
              <Ionicons
                name="stats-chart-outline"
                size={18}
                color={displayMode === "percent" ? "#fff" : theme.color.textMuted}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.toggleText,
                  displayMode === "percent" && styles.toggleTextActive,
                ]}
              >
                Percent
              </Text>
            </Pressable>
          </View>
        </Card>
        </Animated.View>

        {/* Top 3 Anomalies - Enhanced */}
        {topAnomalies.length > 0 && (
          <Card>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="alert-circle" size={24} color={theme.color.warning} />
              <Text style={styles.sectionTitle}>Top {topAnomalies.length} Anomalies</Text>
            </View>
            {topAnomalies.map((anomaly, idx) => (
              <TouchableOpacity
                key={anomaly.year}
                style={[
                  styles.anomalyCard,
                  idx < topAnomalies.length - 1 && styles.anomalyCardBorder,
                ]}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={
                    anomaly.type === "high"
                      ? ["#fef3c7", "#fde68a"]
                      : ["#dbeafe", "#bfdbfe"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.anomalyIconGradient}
                >
                  <MaterialCommunityIcons
                    name={anomaly.type === "high" ? "trending-up" : "trending-down"}
                    size={24}
                    color={anomaly.type === "high" ? "#f59e0b" : "#3b82f6"}
                  />
                </LinearGradient>
                <View style={{ flex: 1, marginLeft: theme.space.sm }}>
                  <View style={styles.anomalyTitleRow}>
                    <Text style={styles.anomalyYear}>{anomaly.year}</Text>
                    <View
                      style={[
                        styles.anomalyBadge,
                        {
                          backgroundColor:
                            anomaly.type === "high" ? "#fef3c7" : "#dbeafe",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.anomalyBadgeText,
                          {
                            color: anomaly.type === "high" ? "#f59e0b" : "#3b82f6",
                          },
                        ]}
                      >
                        {anomaly.deviation >= 0 ? "+" : ""}
                        {anomaly.deviation.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.anomalyTitle}>{anomaly.title}</Text>
                  <Text style={styles.anomalyDescription}>
                    {anomaly.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.color.textMuted} />
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {/* Filter Chips */}
        <Card>
          <Text style={styles.sectionTitle}>Category Filter</Text>
          <View style={styles.chipContainer}>
            <Chip
              label="All"
              selected={!selectedCategory}
              onPress={() => setSelectedCategory(undefined)}
            />
            {categories.slice(0, 5).map((cat) => (
              <Chip
                key={cat}
                label={cat}
                selected={selectedCategory === cat}
                onPress={() =>
                  setSelectedCategory(selectedCategory === cat ? undefined : cat)
                }
              />
            ))}
          </View>
        </Card>

        {/* Filter Controls */}
        <Card>
          <Text style={styles.sectionTitle}>Filter Controls</Text>

          {/* Year Selection */}
          <View style={styles.pickerWrap}>
            <Text style={styles.pickerLabel}>Specific Year (Optional)</Text>
            <Picker
              selectedValue={selectedYear}
              onValueChange={(v) => setSelectedYear(v || undefined)}
            >
              <Picker.Item label="All Years" value={undefined as any} />
              {years.map((y) => (
                <Picker.Item key={y} label={String(y)} value={y} />
              ))}
            </Picker>
          </View>

          {/* Year Range */}
          <View style={styles.rangeContainer}>
            <Text style={styles.pickerLabel}>Year Range</Text>
            <View style={styles.rangeRow}>
              <View style={styles.rangeInput}>
                <Picker
                  selectedValue={minYear}
                  onValueChange={(v) => setMinYear(v || undefined)}
                >
                  <Picker.Item label="Min" value={undefined as any} />
                  {years.map((y) => (
                    <Picker.Item key={y} label={String(y)} value={y} />
                  ))}
                </Picker>
              </View>
              <Text style={styles.rangeSeparator}>to</Text>
              <View style={styles.rangeInput}>
                <Picker
                  selectedValue={maxYear}
                  onValueChange={(v) => setMaxYear(v || undefined)}
                >
                  <Picker.Item label="Max" value={undefined as any} />
                  {years.map((y) => (
                    <Picker.Item key={y} label={String(y)} value={y} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Deviation Threshold */}
          <View style={styles.thresholdContainer}>
            <Text style={styles.pickerLabel}>
              Deviation Threshold: {deviationThreshold}%
            </Text>
            <View style={styles.thresholdButtons}>
              {[20, 30, 50, 75, 100].map((val) => (
                <Pressable
                  key={val}
                  style={[
                    styles.thresholdBtn,
                    deviationThreshold === val && styles.thresholdBtnActive,
                  ]}
                  onPress={() => setDeviationThreshold(val)}
                >
                  <Text
                    style={[
                      styles.thresholdBtnText,
                      deviationThreshold === val && styles.thresholdBtnTextActive,
                    ]}
                  >
                    {val}%
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Card>

        {/* Yearly Anomalies List */}
        <Card>
          <Text style={styles.sectionTitle}>Yearly Anomalies List</Text>
          {yearlyData.data.length === 0 ? (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={["#e0e7ff", "#c7d2fe"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.emptyIconGradient}
              >
                <MaterialCommunityIcons name="database-off" size={48} color="#6366f1" />
              </LinearGradient>
              <Text style={styles.emptyTitle}>No Data Found</Text>
              <Text style={styles.emptyText}>
                Try adjusting your filters to see results
              </Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setSelectedCategory(undefined);
                  setSelectedYear(undefined);
                  setMinYear(years.length > 0 ? Math.min(...years) : undefined);
                  setMaxYear(years.length > 0 ? Math.max(...years) : undefined);
                }}
              >
                <LinearGradient
                  colors={["#22c55e", "#16a34a"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.resetButtonGradient}
                >
                  <Ionicons name="refresh" size={20} color="#fff" />
                  <Text style={styles.resetButtonText}>Reset Filters</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            yearlyData.data.map((yearData) => (
              <TouchableOpacity
                key={yearData.year}
                style={styles.yearRow}
                onPress={() => handleYearDrillDown(yearData.year)}
                activeOpacity={0.7}
              >
                <View style={styles.yearLeftSection}>
                  <LinearGradient
                    colors={
                      yearData.isHighAnomaly
                        ? ["#22c55e", "#16a34a"]
                        : yearData.isLowAnomaly
                        ? ["#ef4444", "#dc2626"]
                        : ["#6b7280", "#4b5563"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.yearIconGradient}
                  >
                    <Text style={styles.yearIconText}>{yearData.year}</Text>
                  </LinearGradient>
                </View>

                <View style={{ flex: 1, marginLeft: theme.space.sm }}>
                  <View style={styles.yearHeaderRow}>
                    <Text style={styles.yearText}>
                      {displayMode === "absolute"
                        ? `${fmt.format(yearData.total)} LKR`
                        : `${yearData.deviation >= 0 ? "+" : ""}${yearData.deviation.toFixed(1)}% from mean`}
                    </Text>
                  </View>

                  {displayMode === "absolute" && (
                    <View style={styles.yearChangeRow}>
                      <Ionicons
                        name={yearData.percentChange >= 0 ? "arrow-up-circle" : "arrow-down-circle"}
                        size={16}
                        color={yearData.percentChange >= 0 ? "#22c55e" : "#ef4444"}
                      />
                      <Text
                        style={[
                          styles.yearChange,
                          {
                            color:
                              yearData.percentChange >= 0
                                ? "#22c55e"
                                : "#ef4444",
                          },
                        ]}
                      >
                        {yearData.percentChange >= 0 ? "+" : ""}
                        {yearData.percentChange.toFixed(1)}% vs previous
                      </Text>
                    </View>
                  )}
                  <View style={styles.yearMetaRow}>
                    <Feather name="layers" size={14} color={theme.color.textMuted} />
                    <Text style={styles.yearCount}>
                      {yearData.count} item{yearData.count !== 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>

                <View style={styles.yearRightSection}>
                  {(yearData.isHighAnomaly || yearData.isLowAnomaly) && (
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: yearData.isHighAnomaly
                            ? "#dcfce7"
                            : "#fee2e2",
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={yearData.isHighAnomaly ? "alert-circle" : "alert-circle-outline"}
                        size={16}
                        color={yearData.isHighAnomaly ? "#16a34a" : "#dc2626"}
                      />
                      <Text
                        style={[
                          styles.badgeText,
                          {
                            color: yearData.isHighAnomaly
                              ? "#16a34a"
                              : "#dc2626",
                          },
                        ]}
                      >
                        {yearData.isHighAnomaly ? "High" : "Low"}
                      </Text>
                    </View>
                  )}
                  <Ionicons name="eye-outline" size={20} color={theme.color.info} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </Card>

        <View style={{ height: theme.space.xl }} />
      </Animated.ScrollView>

      {/* Drill-Down Modal */}
      <Modal
        visible={drillDownYear !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDrillDownYear(null)}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Year {drillDownYear} Details</Text>
              <Text style={styles.modalSubtitle}>
                {drillDownItems.length} tax item{drillDownItems.length !== 1 ? "s" : ""}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setDrillDownYear(null)}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.modalScrollContent}
          >
            {drillDownItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No items found for this year.</Text>
              </View>
            ) : (
              <>
                {/* Summary Card */}
                <Card>
                  <Text style={styles.cardLabel}>Summary</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Amount:</Text>
                    <Text style={styles.summaryValue}>
                      {fmt.format(
                        drillDownItems.reduce((sum, item) => sum + item.amount, 0)
                      )}{" "}
                      LKR
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Average per Item:</Text>
                    <Text style={styles.summaryValue}>
                      {fmt.format(
                        drillDownItems.reduce((sum, item) => sum + item.amount, 0) /
                          drillDownItems.length
                      )}{" "}
                      LKR
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Categories:</Text>
                    <Text style={styles.summaryValue}>
                      {Array.from(new Set(drillDownItems.map((i) => i.category))).length}
                    </Text>
                  </View>
                </Card>

                {/* Individual Items */}
                <Card>
                  <Text style={styles.sectionTitle}>Individual Tax Items</Text>
                  {drillDownItems.map((item, idx) => (
                    <View
                      key={item.id}
                      style={[
                        styles.drillDownItem,
                        idx < drillDownItems.length - 1 && styles.drillDownItemBorder,
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.drillDownItemName}>{item.name || "—"}</Text>
                        <Text style={styles.drillDownItemMeta}>{item.category}</Text>
                      </View>
                      <Text style={styles.drillDownItemAmount}>
                        {fmt.format(item.amount)} LKR
                      </Text>
                    </View>
                  ))}
                </Card>

                {/* Category Breakdown */}
                <Card>
                  <Text style={styles.sectionTitle}>By Category</Text>
                  {Array.from(
                    drillDownItems.reduce((map, item) => {
                      const current = map.get(item.category) || { count: 0, total: 0 };
                      map.set(item.category, {
                        count: current.count + 1,
                        total: current.total + item.amount,
                      });
                      return map;
                    }, new Map<string, { count: number; total: number }>())
                  )
                    .sort((a, b) => b[1].total - a[1].total)
                    .map(([category, data]) => (
                      <View key={category} style={styles.categoryBreakdownRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.categoryBreakdownName}>{category}</Text>
                          <Text style={styles.categoryBreakdownMeta}>
                            {data.count} item{data.count !== 1 ? "s" : ""}
                          </Text>
                        </View>
                        <Text style={styles.categoryBreakdownAmount}>
                          {fmt.format(data.total)} LKR
                        </Text>
                      </View>
                    ))}
                </Card>
              </>
            )}

            <View style={{ height: theme.space.xl }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...theme.shadow.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.space.lg,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginLeft: 38,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: theme.space.sm,
  },
  scrollContent: {
    padding: theme.space.lg,
    gap: theme.space.md,
  },
  // Shimmer Loading
  shimmerCard: {
    backgroundColor: "#ffffff",
    borderRadius: theme.radius.lg,
    padding: theme.space.lg,
    marginBottom: theme.space.md,
    ...theme.shadow.card,
  },
  // Error Card
  errorCard: {
    backgroundColor: "#ffffff",
    borderRadius: theme.radius.lg,
    padding: theme.space.xl,
    alignItems: "center",
    ...theme.shadow.card,
  },
  errorIconWrapper: {
    marginBottom: theme.space.md,
  },
  errorIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow.card,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.color.danger,
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: theme.color.textMuted,
    textAlign: "center",
  },
  // Action Cards Grid
  // Unified Actions Bar
  actionsBarWrapper: {
    marginVertical: theme.space.md,
  },
  actionsBar: {
    flexDirection: "row",
    paddingHorizontal: theme.space.lg,
    gap: theme.space.sm,
  },
  actionButton: {
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  // Stats Card
  statsCard: {
    position: "relative",
    backgroundColor: "#ffffff",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  statsIconWrapper: {
    position: "absolute",
    top: -15,
    right: 20,
    zIndex: 1,
  },
  statsIconGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow.card,
  },
  cardLabel: {
    fontSize: 11,
    color: theme.color.textMuted,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "700",
  },
  avgTotalRow: {
    marginBottom: theme.space.md,
  },
  avgTotalValue: {
    fontSize: 36,
    fontWeight: "800",
    color: theme.color.text,
    letterSpacing: -1,
  },
  avgTotalCurrency: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.color.textMuted,
    marginTop: 4,
  },
  changeRow: {
    marginTop: 12,
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  changeText: {
    fontSize: 14,
    fontWeight: "700",
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: theme.radius.md,
    padding: 4,
    marginTop: theme.space.sm,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    gap: 4,
  },
  toggleBtnActive: {
    backgroundColor: theme.color.brand,
    ...theme.shadow.card,
  },
  toggleText: {
    fontSize: 14,
    color: theme.color.textMuted,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#fff",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: theme.space.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.color.text,
  },
  anomalyCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.space.md,
    paddingHorizontal: theme.space.sm,
    marginVertical: 4,
    backgroundColor: "#ffffff",
    borderRadius: theme.radius.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  anomalyCardBorder: {
    borderBottomWidth: 0,
  },
  anomalyIconGradient: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  anomalyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  anomalyYear: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.color.text,
  },
  anomalyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  anomalyBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  anomalyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.color.text,
    marginBottom: 4,
  },
  anomalyDescription: {
    fontSize: 13,
    color: theme.color.textMuted,
    lineHeight: 18,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.space.xs,
  },
  pickerWrap: {
    marginBottom: theme.space.sm,
  },
  pickerLabel: {
    fontSize: theme.font.body,
    fontWeight: "600",
    color: theme.color.text,
    marginBottom: theme.space.xs,
  },
  rangeContainer: {
    marginBottom: theme.space.sm,
  },
  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
  },
  rangeInput: {
    flex: 1,
  },
  rangeSeparator: {
    fontSize: theme.font.body,
    color: theme.color.textMuted,
    paddingHorizontal: theme.space.xs,
  },
  thresholdContainer: {
    marginTop: theme.space.sm,
  },
  thresholdButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.space.xs,
    marginTop: theme.space.xs,
  },
  thresholdBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.color.chip,
    borderWidth: 1,
    borderColor: theme.color.chipBorder,
  },
  thresholdBtnActive: {
    backgroundColor: theme.color.brand,
    borderColor: theme.color.brand,
  },
  thresholdBtnText: {
    fontSize: theme.font.small,
    color: theme.color.text,
    fontWeight: "600",
  },
  thresholdBtnTextActive: {
    color: "#fff",
  },
  yearRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.space.md,
    paddingHorizontal: theme.space.sm,
    marginVertical: 4,
    backgroundColor: "#ffffff",
    borderRadius: theme.radius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  yearLeftSection: {
    marginRight: theme.space.sm,
  },
  yearIconGradient: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow.card,
  },
  yearIconText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  yearHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  yearText: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.color.text,
    flex: 1,
  },
  yearAmount: {
    fontSize: 14,
    color: theme.color.textMuted,
    marginTop: 2,
  },
  yearChangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  yearChange: {
    fontSize: 13,
    fontWeight: "600",
  },
  yearMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  yearCount: {
    fontSize: 12,
    color: theme.color.textMuted,
  },
  yearRightSection: {
    alignItems: "flex-end",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  emptyState: {
    paddingVertical: theme.space.xl * 2,
    alignItems: "center",
  },
  emptyIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.space.lg,
    ...theme.shadow.card,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.color.text,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    color: theme.color.textMuted,
    textAlign: "center",
    marginBottom: theme.space.lg,
    lineHeight: 22,
  },
  resetButton: {
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    ...theme.shadow.card,
  },
  resetButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.space.sm,
  },
  chartToggle: {
    flexDirection: "row",
    backgroundColor: theme.color.lightGray,
    borderRadius: theme.radius.sm,
    padding: 2,
  },
  chartToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.sm - 2,
  },
  chartToggleBtnActive: {
    backgroundColor: theme.color.brand,
  },
  chartToggleText: {
    fontSize: theme.font.small,
    color: theme.color.textMuted,
    fontWeight: "600",
  },
  chartToggleTextActive: {
    color: "#fff",
  },
  chartNote: {
    fontSize: theme.font.small,
    color: theme.color.textMuted,
    textAlign: "center",
    marginTop: theme.space.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.space.lg,
    paddingTop: theme.space.xl,
    paddingBottom: theme.space.lg,
    backgroundColor: "#ffffff",
    borderBottomWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: theme.font.h1,
    fontWeight: "700",
    color: theme.color.text,
  },
  modalSubtitle: {
    fontSize: theme.font.body,
    color: theme.color.textMuted,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalCloseBtnText: {
    fontSize: 22,
    color: theme.color.text,
    fontWeight: "700",
  },
  modalScrollContent: {
    padding: theme.space.lg,
    gap: theme.space.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.space.xs,
  },
  summaryLabel: {
    fontSize: theme.font.body,
    color: theme.color.textMuted,
  },
  summaryValue: {
    fontSize: theme.font.body,
    fontWeight: "700",
    color: theme.color.text,
  },
  drillDownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.space.sm,
  },
  drillDownItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border + "20",
  },
  drillDownItemName: {
    fontSize: theme.font.body,
    fontWeight: "600",
    color: theme.color.text,
    marginBottom: 2,
  },
  drillDownItemMeta: {
    fontSize: theme.font.small,
    color: theme.color.textMuted,
  },
  drillDownItemAmount: {
    fontSize: theme.font.body,
    fontWeight: "700",
    color: theme.color.brand,
    marginLeft: theme.space.sm,
  },
  categoryBreakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.space.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border + "20",
  },
  categoryBreakdownName: {
    fontSize: theme.font.body,
    fontWeight: "600",
    color: theme.color.text,
    marginBottom: 2,
  },
  categoryBreakdownMeta: {
    fontSize: theme.font.small,
    color: theme.color.textMuted,
  },
  categoryBreakdownAmount: {
    fontSize: theme.font.h2,
    fontWeight: "700",
    color: theme.color.text,
    marginLeft: theme.space.sm,
  },
  // AI Insights Styles
  aiInsightsCard: {
    backgroundColor: "#ffffff",
    padding: theme.space.lg,
    shadowColor: "#ec4899",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  aiInsightsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.space.lg,
    paddingBottom: theme.space.md,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  aiIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow.card,
  },
  aiInsightsTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.color.text,
  },
  aiInsightsSubtitle: {
    fontSize: 12,
    color: theme.color.textMuted,
    marginTop: 2,
  },
  aiSection: {
    marginBottom: theme.space.lg,
  },
  aiSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: theme.space.sm,
  },
  aiSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.color.text,
  },
  aiText: {
    fontSize: 15,
    color: theme.color.text,
    lineHeight: 24,
  },
  predictionCard: {
    padding: theme.space.lg,
    borderRadius: theme.radius.lg,
    marginBottom: theme.space.lg,
  },
  predictionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: theme.space.sm,
  },
  predictionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f59e0b",
  },
  predictionValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#f59e0b",
    marginBottom: theme.space.xs,
  },
  confidenceBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: theme.space.sm,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#f59e0b",
  },
  predictionReasoning: {
    fontSize: 14,
    color: "#92400e",
    lineHeight: 20,
  },
  findingRow: {
    flexDirection: "row",
    marginBottom: theme.space.xs,
    paddingLeft: 8,
  },
  findingBullet: {
    fontSize: 16,
    color: theme.color.brand,
    marginRight: 8,
    fontWeight: "700",
  },
  findingText: {
    flex: 1,
    fontSize: 14,
    color: theme.color.text,
    lineHeight: 22,
  },
  riskOppRow: {
    flexDirection: "row",
    gap: theme.space.sm,
    marginBottom: theme.space.lg,
  },
  riskOppCard: {
    flex: 1,
    padding: theme.space.md,
    backgroundColor: "#f8fafc",
    borderRadius: theme.radius.md,
  },
  riskOppHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: theme.space.sm,
  },
  riskOppTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  riskOppText: {
    fontSize: 12,
    color: theme.color.textMuted,
    lineHeight: 18,
    marginBottom: 4,
  },
  yearInsightCard: {
    backgroundColor: "#f8fafc",
    padding: theme.space.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.space.sm,
    borderLeftWidth: 4,
    borderLeftColor: "#ec4899",
  },
  yearInsightHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.space.sm,
  },
  yearInsightYear: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.color.text,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  severityText: {
    fontSize: 11,
    fontWeight: "700",
  },
  yearInsightExplanation: {
    fontSize: 14,
    color: theme.color.text,
    lineHeight: 22,
    marginBottom: theme.space.sm,
  },
  actionsSection: {
    marginTop: theme.space.sm,
    paddingTop: theme.space.sm,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  actionsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.color.text,
    marginBottom: 6,
  },
  actionText: {
    fontSize: 13,
    color: theme.color.brand,
    lineHeight: 20,
    marginBottom: 4,
  },
});

