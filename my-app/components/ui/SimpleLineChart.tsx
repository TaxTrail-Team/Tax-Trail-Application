import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect, G, Circle, Line } from 'react-native-svg';
import { theme } from '../../theme';
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface DataPoint {
  label: string; // month/year label
  value: number;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  height?: number;
}

// Catmull-Rom to Bezier conversion for smooth curves
function catmullRom2bezier(points: { x: number; y: number }[]) {
  const cr = (pts: { x: number; y: number }[]) => {
    const d = [] as string[];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? i : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const bp1x = p1.x + (p2.x - p0.x) / 6;
      const bp1y = p1.y + (p2.y - p0.y) / 6;
      const bp2x = p2.x - (p3.x - p1.x) / 6;
      const bp2y = p2.y - (p3.y - p1.y) / 6;

      if (i === 0) {
        d.push(`M ${p1.x} ${p1.y}`);
      }
      d.push(`C ${bp1x} ${bp1y}, ${bp2x} ${bp2y}, ${p2.x} ${p2.y}`);
    }
    return d.join(' ');
  };

  return cr(points);
}

export default function SimpleLineChart({ data, height = 260 }: SimpleLineChartProps) {
  const fade = useRef(new Animated.Value(0)).current;
  const [range, setRange] = useState<'1Y' | '3Y'>('1Y');
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const [displayData, setDisplayData] = useState<DataPoint[]>(data);
  const [isLoading, setIsLoading] = useState(false);
  const animProgress = useRef(new Animated.Value(0)).current; // animate redraw

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fade]);

  if (!data || data.length === 0) {
    return (
      <View style={[styles.card, { height }]}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  const width = Dimensions.get('window').width - 48; // card padding + some margin
  const padding = { top: 24, bottom: 48, left: 40, right: 16 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const values = displayData.map((d) => d.value);
  const max = Math.max(...values) || 0;
  const min = Math.min(...values) || 0;
  const pad = (max - min) * 0.1 || max * 0.1;
  const yMax = Math.ceil((max + pad) / 1000) * 1000;
  const yMin = Math.max(0, Math.floor((min - pad) / 1000) * 1000);
  const yRange = yMax - yMin || 1;

  // map data points to SVG coordinates
  const points = displayData.map((d, i) => {
    const x = padding.left + (i / Math.max(1, data.length - 1)) * chartW;
    const y = padding.top + ((yMax - d.value) / yRange) * chartH;
    return { x, y };
  });

  const path = catmullRom2bezier(points);

  const areaPath = `${path} L ${padding.left + chartW} ${padding.top + chartH} L ${padding.left} ${padding.top + chartH} Z`;

  const yTicks = 4;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => yMin + (yRange * i) / yTicks).reverse();

  // animate entry
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fade]);
    // Aggregation helpers
    function last12Months(raw: DataPoint[]) {
      const slice = raw.slice(-12);
      return slice.map((d) => ({ ...d }));
    }

    function aggregateQuarterly(raw: DataPoint[]) {
      const months = raw.slice(-36);
      if (months.length === 0) return raw;
      const quarters: { label: string; value: number }[] = [];
      for (let i = 0; i < months.length; i += 3) {
        const chunk = months.slice(i, i + 3);
        const sum = chunk.reduce((s, c) => s + c.value, 0);
        const lab = chunk[chunk.length - 1].label;
        quarters.push({ label: lab, value: Math.round(sum) });
      }
      return quarters;
    }

    // yearly aggregation removed — 5Y option disabled

    useEffect(() => {
      let mounted = true;
      setIsLoading(true);
      const timer = setTimeout(() => {
        if (!mounted) return;
        let next: DataPoint[] = data;
  if (range === '1Y') next = last12Months(data);
  if (range === '3Y') next = aggregateQuarterly(data);
        setDisplayData(next.length > 0 ? next : data);
        animProgress.setValue(0);
        Animated.timing(animProgress, { toValue: 1, duration: 500, useNativeDriver: true }).start();
        setIsLoading(false);
      }, 300);

      return () => {
        mounted = false;
        clearTimeout(timer);
      };
    }, [range, data]);

    return (
      <Animated.View style={[styles.card, { height, opacity: fade }]}> 
        <View style={styles.topRightControls} pointerEvents="box-none">
          <View style={styles.rangeRow}>
            {(['1Y', '3Y'] as const).map((r) => {
              const active = range === r;
              return (
                <AnimatedTouchable
                  key={r}
                  activeOpacity={0.9}
                  onPress={() => setRange(r)}
                  style={[
                    styles.rangeButton, 
                    active ? styles.rangeButtonActive : styles.rangeButtonInactive,
                    { transform: [{ scale: active ? 1.05 : 1 }] }
                  ]}
                >
                  <Text style={[styles.rangeText, active && styles.rangeTextActive]}>{r}</Text>
                </AnimatedTouchable>
              );
            })}
          </View>
        </View>

      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#d1fae5" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#d1fae5" stopOpacity="0.05" />
          </LinearGradient>
          <LinearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#16a34a" stopOpacity="1" />
            <Stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* background grid */}
        {yLabels.map((val, idx) => {
          const y = padding.top + (idx / yTicks) * chartH;
          return (
            <Line key={idx} x1={padding.left} x2={padding.left + chartW} y1={y} y2={y} stroke={theme.color.border + '40'} strokeWidth={1} />
          );
        })}

        {/* area fill */}
        <Path d={areaPath} fill="url(#grad)" />

  {/* line */}
  <Path d={path} fill="none" stroke="url(#lineGrad)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

        {/* markers */}
        <G>
          {points.map((p, i) => (
            <G key={`pt-${i}`}>
              <Circle
                cx={p.x}
                cy={p.y}
                r={6}
                fill="#ffffff"
                stroke={theme.color.danger}
                strokeWidth={3}
                onPress={() => setActiveTooltip(i === activeTooltip ? null : i)}
              />
              <Circle cx={p.x} cy={p.y} r={3} fill={theme.color.danger} />
            </G>
          ))}
        </G>

        {/* x-axis labels (show a subset if too many) */}
        {data.map((d, i) => {
          const show = data.length <= 8 || i % Math.ceil(data.length / 8) === 0 || i === data.length - 1;
          if (!show) return null;
          const x = padding.left + (i / Math.max(1, data.length - 1)) * chartW;
          const y = padding.top + chartH + 16;
          return (
            <TextSVG key={`xl-${i}`} x={x} y={y} fontSize={10} fill={theme.color.text} textAnchor="middle">
              {d.label}
            </TextSVG>
          );
        })}

        {/* y-axis labels as text using SVG Text is less flexible; render using overlay below SVG */}
      </Svg>

      {/* Overlay: Y labels and tooltips and bottom note */}
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.yLabelCol}>
          {yLabels.map((val, idx) => (
            <Text key={idx} style={styles.yLabel}>{`${Math.round(val / 1000)}K`}</Text>
          ))}
        </View>

        {/* tooltips */}
        {activeTooltip != null && (() => {
          const p = points[activeTooltip];
          const d = data[activeTooltip];
          return (
            <View key={`tt-${activeTooltip}`} style={[styles.tooltip, { left: p.x - 50, top: p.y - 60 }]}>
              <Text style={styles.tooltipText}>{d.label}</Text>
              <Text style={styles.tooltipValue}>LKR {d.value.toLocaleString()}</Text>
            </View>
          );
        })()}

        <View style={styles.bottomNoteRow}>
          <Text style={styles.note}>💡 Values shown in thousands (K) LKR</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// Helper component: render SVG Text using a small wrapper to avoid import issues with types
const TextSVG = ({ x, y, children, fontSize = 10, fill = '#000', textAnchor = 'start' }: any) => (
  // @ts-ignore - JSX for react-native-svg Text
  <SvgText x={x} y={y} fontSize={fontSize} fill={fill} textAnchor={textAnchor}>{children}</SvgText>
);

// Import SvgText dynamically (avoid top-level type import issues)
const { Text: SvgText } = require('react-native-svg') as any;

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.color.card,
    borderRadius: theme.radius.md,
    padding: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden'
  },
  noDataText: {
    color: theme.color.text,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 40
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  modeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.color.border + '50'
  },
  modeButtonActive: {
    backgroundColor: '#16a34a',
  },
  modeButtonText: {
    color: theme.color.text,
    fontWeight: '700'
  },
  modeButtonTextActive: {
    color: '#ffffff'
  },
  rangeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.color.border + '40',
    backgroundColor: 'transparent'
  },
  rangeButtonActive: {
    backgroundColor: '#22c55e'
  },
  rangeButtonInactive: {
    backgroundColor: 'transparent',
    borderColor: theme.color.border,
    borderWidth: 1
  },
  topRightControls: { position: 'absolute', right: 12, top: 12, zIndex: 10 },
  rangeRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  rangeText: { color: theme.color.text, fontWeight: '700' },
  rangeTextActive: { color: '#fff' },
  overlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  yLabelCol: { position: 'absolute', left: 8, top: 24, bottom: 48, justifyContent: 'space-between' },
  yLabel: { fontSize: 12, color: theme.color.text, opacity: 0.7, textAlign: 'left' },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.color.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
    width: 100,
    alignItems: 'center'
  },
  tooltipText: { fontSize: 11, color: theme.color.text, opacity: 0.7 },
  tooltipValue: { fontSize: 13, color: theme.color.pill, fontWeight: '800', marginTop: 4 },
  bottomNoteRow: { position: 'absolute', left: 12, right: 12, bottom: 8, alignItems: 'center' },
  note: { fontSize: 12, color: theme.color.text, opacity: 0.7 }
});
