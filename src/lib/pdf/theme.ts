import { StyleSheet } from "@react-pdf/renderer";

export const PDF_COLORS = {
  primary: "#1E3A8A", // biru gelap (sesuai warna header di reference UI)
  primaryLight: "#EFF4FF",
  good: "#16A34A",
  goodBg: "#F0FDF4",
  attention: "#D97706",
  attentionBg: "#FFFBEB",
  problem: "#DC2626",
  problemBg: "#FEF2F2",
  gray: "#6B7280",
  border: "#E5E7EB",
  text: "#111827",
  textMuted: "#6B7280",
};

export const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 48,
    paddingHorizontal: 36,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: PDF_COLORS.text,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: PDF_COLORS.primary,
    paddingBottom: 10,
    marginBottom: 14,
  },
  companyName: {
    fontSize: 13,
    fontWeight: 700,
    color: PDF_COLORS.primary,
  },
  companyDetail: {
    fontSize: 7.5,
    color: PDF_COLORS.textMuted,
    marginTop: 1,
  },
  reportTitle: {
    fontSize: 12,
    fontWeight: 700,
    textAlign: "right",
    color: PDF_COLORS.text,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: 700,
    color: PDF_COLORS.primary,
    marginBottom: 6,
    marginTop: 14,
  },
  card: {
    borderWidth: 1,
    borderColor: PDF_COLORS.border,
    borderRadius: 4,
    padding: 10,
  },
  row: {
    flexDirection: "row",
  },
  labelValueRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  label: {
    width: 90,
    color: PDF_COLORS.textMuted,
  },
  value: {
    flex: 1,
    fontWeight: 700,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: PDF_COLORS.textMuted,
    borderTopWidth: 1,
    borderTopColor: PDF_COLORS.border,
    paddingTop: 6,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: PDF_COLORS.border,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tableHeaderText: {
    fontSize: 7.5,
    fontWeight: 700,
    color: PDF_COLORS.textMuted,
    textTransform: "uppercase",
  },
});

export function conditionColor(condition: string | null | undefined) {
  switch (condition) {
    case "GOOD":
      return { fg: PDF_COLORS.good, bg: PDF_COLORS.goodBg, label: "Baik" };
    case "ATTENTION":
      return { fg: PDF_COLORS.attention, bg: PDF_COLORS.attentionBg, label: "Perhatian" };
    case "PROBLEM":
      return { fg: PDF_COLORS.problem, bg: PDF_COLORS.problemBg, label: "Bermasalah" };
    default:
      return { fg: PDF_COLORS.gray, bg: "#F3F4F6", label: "N/A" };
  }
}
