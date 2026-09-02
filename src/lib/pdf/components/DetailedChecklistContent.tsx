import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfStyles, conditionColor, PDF_COLORS } from "../theme";
import type { DetailedReportSection } from "@/types/report";

const styles = StyleSheet.create({
  colCode: { width: 55 },
  colName: { flex: 1 },
  colCondition: { width: 70 },
  colNotes: { flex: 1.2 },
  conditionBadge: {
    fontSize: 7.5,
    fontWeight: 700,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    alignSelf: "flex-start",
  },
});

export function DetailedChecklistContent({ sections }: { sections: DetailedReportSection[] }) {
  return (
    <View>
      <Text style={pdfStyles.sectionTitle}>Detailed Inspection Checklist</Text>
      {sections.map((section) => (
        <View key={section.code} wrap={false} style={{ marginBottom: 10 }}>
          <Text style={{ fontWeight: 700, marginBottom: 3, fontSize: 9.5 }}>
            {section.name}
          </Text>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderText, styles.colCode]}>Kode</Text>
            <Text style={[pdfStyles.tableHeaderText, styles.colName]}>Item</Text>
            <Text style={[pdfStyles.tableHeaderText, styles.colCondition]}>Kondisi</Text>
            <Text style={[pdfStyles.tableHeaderText, styles.colNotes]}>Catatan</Text>
          </View>
          {section.items.map((item) => {
            const tone = conditionColor(item.condition);
            return (
              <View key={item.code} style={pdfStyles.tableRow} wrap={false}>
                <Text style={[styles.colCode, { fontSize: 7.5, color: PDF_COLORS.textMuted }]}>
                  {item.code}
                </Text>
                <Text style={styles.colName}>{item.name}</Text>
                <View style={styles.colCondition}>
                  <Text style={[styles.conditionBadge, { color: tone.fg, backgroundColor: tone.bg }]}>
                    {tone.label}
                  </Text>
                </View>
                <Text style={[styles.colNotes, { fontSize: 8 }]}>
                  {item.technicalValue
                    ? `${item.technicalValue}${item.technicalUnit ?? ""}${item.notes ? " — " : ""}`
                    : ""}
                  {item.notes ?? ""}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
