import { StyleSheet } from "react-native";
import { theme } from "../theme";

const styles = StyleSheet.create({
  header: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 10, backgroundColor: "#d7def0ff" },
  title: { fontSize: 24, fontWeight: "900", color: "#000000ff" },
  subtitle: { color: "#000000ff", marginTop: 4 },

  label: { color: "#000000ff", fontWeight: "800", marginBottom: 8, fontSize: 16 },
linkBtn: {
    margin: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#0ea5e9",
  },
  linkBtnTxt: { color: "white", fontWeight: "800" },
  pickerWrap: {
    flex: 1,
    backgroundColor: "#ffffffff",
    borderRadius: 12,
    borderWidth: 1, borderColor: "#1f2a3d",
    overflow: "hidden",
  
  },
  pickerLabel: { color: "#000000ff", fontSize: 12, paddingHorizontal: 10, paddingTop: 8 },

  currencyBtn: {
    backgroundColor: "#d3d3d3ff",
    borderRadius: 12,
    borderWidth: 1, borderColor: "#1f2a3d",
    paddingVertical: 12, paddingHorizontal: 12,
  },
  currencyBtnTxt: { color: "#000000ff", fontWeight: "700" },

  previewRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#1f2937" },
  previewTitle: { color: "#000000ff", fontWeight: "800" },
  previewMeta: { color: "#000000ff" },
  previewAmount: { marginTop: 4, fontWeight: "900", color: "#000000ff" },

  resultCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#ffffffff", borderRadius: 12, borderWidth: 1, borderColor: "#1f2937",
    padding: 12, marginBottom: 10,
  },
  resultName: { color: "#000000ff", fontWeight: "800" },
  resultMeta: { color: "#000000ff" },
  resultAmount: { marginTop: 4, fontWeight: "900", color: "#000000ff" },
  auditText: { color: "#000000ff", fontSize: 12, marginTop: 2 },

  emptyState: { alignItems: "center", padding: 16 },
  emptyTitle: { color: "#000000ff", fontWeight: "900", fontSize: 16 },
  emptyText: { color: "#0d0d0eff", textAlign: "center", marginTop: 6 },

  loadingOverlay: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "rgba(255, 255, 255, 0.35)", alignItems: "center", justifyContent: "center" },
});
export default styles;
