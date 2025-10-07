import React, { useMemo, useState } from "react";
import { Modal, View, Text, TextInput, FlatList, Pressable, StyleSheet } from "react-native";
import { theme } from "../theme";
import { currencyToFlag, codeToNiceName } from "../../my-app/src/lib/currency";

type Opt = { code: string; label?: string };
export default function QuickCurrencyPicker({
  visible, onClose, options, value, onSelect
}: {
  visible: boolean;
  onClose: () => void;
  options: Opt[];
  value?: string;
  onSelect: (code: string) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const lq = q.toLowerCase();
    return options.filter(o =>
      o.code.toLowerCase().includes(lq) ||
      codeToNiceName(o.code).toLowerCase().includes(lq)
    );
  }, [q, options]);
  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose} transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Choose Currency</Text>
          <TextInput
            placeholder="Search code or name"
            placeholderTextColor={theme.color.textMuted}
            value={q}
            onChangeText={setQ}
            style={styles.input}
          />
          <FlatList
            data={filtered}
            keyExtractor={(i) => i.code}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => { onSelect(item.code); onClose(); }}
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.rowTxt}>
                  {currencyToFlag(item.code)}  {item.code} — {codeToNiceName(item.code)}
                  {value === item.code ? "  ✓" : ""}
                </Text>
              </Pressable>
            )}
          />
          <Pressable onPress={onClose} style={styles.closeBtn}><Text style={{ color: theme.color.text }}>Close</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.6)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: theme.color.cardAlt,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: "75%", padding: 16, borderWidth: 1, borderColor: theme.color.border
  },
  title: { color: theme.color.text, fontSize: 16, fontWeight: "800", marginBottom: 8 },
  input: {
    backgroundColor: "#fdfdfdff", borderRadius: 10, borderWidth: 1, borderColor: theme.color.border,
    color: theme.color.text, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10,
  },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.color.border },
  rowTxt: { color: theme.color.text },
  closeBtn: { alignSelf: "center", paddingVertical: 12 },
});
