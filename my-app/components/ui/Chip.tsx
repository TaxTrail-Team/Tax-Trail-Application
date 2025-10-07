import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { theme } from "../../theme";

type Props = { label: string; selected?: boolean; onPress?: () => void };
export default function Chip({ label, selected, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.base, selected && styles.sel]}>
      <Text style={[styles.txt, selected && styles.selTxt]}>{label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: theme.color.chip,
    borderWidth: 1,
    borderColor: theme.color.chipBorder,
    marginRight: 8,
    marginBottom: 8,
  },
  txt: { color: theme.color.textMuted, fontSize: 12, fontWeight: "700" },
  sel: { backgroundColor: theme.color.brandSoft, borderColor: theme.color.brandSoft },
  selTxt: { color: "#030303ff" },
});
