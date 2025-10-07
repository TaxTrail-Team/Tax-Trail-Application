import React from "react";
import { View, StyleSheet } from "react-native";
import { theme } from "../../theme";

export default function SkeletonRow() {
  return (
    <View style={styles.wrap}>
      <View style={styles.lineWide} />
      <View style={styles.line} />
      <View style={styles.badge} />
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { paddingVertical: 10, gap: 8 },
  lineWide: { height: 14, width: "70%", backgroundColor: theme.color.border, borderRadius: 6 },
  line: { height: 10, width: "40%", backgroundColor: theme.color.border, borderRadius: 6 },
  badge: { height: 18, width: 80, backgroundColor: theme.color.border, borderRadius: 999 },
});
