import { StyleSheet } from "@react-pdf/renderer";

// Warna diambil dari sampel piksel logo/template asli perusahaan (OTORIZ).
export const PDF_COLORS = {
  primary: "#A07635", // gold/bronze — dipakai untuk heading, angka skor, dsb
  primaryDark: "#7C5B28", // gold lebih gelap — dipakai untuk garis pembatas tebal
  primaryLight: "#FBF6EE",
  good: "#16A34A",
  goodBg: "#F0FDF4",
  attention: "#D97706",
  attentionBg: "#FFFBEB",
  problem: "#DC2626",
  problemBg: "#FEF2F2",
  gray: "#6B7280",
  border: "#E2E2E2",
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
  watermark: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2.5,
    borderBottomColor: PDF_COLORS.primaryDark,
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
    fontSize: 8,
    fontWeight: 700,
    textAlign: "right",
    color: PDF_COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 3,
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
    backgroundColor: "#FAF7F2",
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
