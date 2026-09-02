import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfStyles, conditionColor, PDF_COLORS } from "../theme";
import type { ReportData } from "@/types/report";
import {
  ACCIDENT_ASSESSMENT_OPTIONS,
  FLOOD_ASSESSMENT_OPTIONS,
  FINAL_RECOMMENDATION_OPTIONS,
  OVERALL_CONDITION_OPTIONS,
  SEVERITY_LABEL,
} from "@/config/constants";

const styles = StyleSheet.create({
  infoGrid: {
    flexDirection: "row",
    gap: 12,
  },
  infoCol: {
    flex: 1,
  },
  scoreRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  scoreBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: PDF_COLORS.border,
    borderRadius: 4,
    padding: 10,
    alignItems: "center",
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: 700,
    color: PDF_COLORS.primary,
  },
  scoreLabel: {
    fontSize: 7.5,
    color: PDF_COLORS.textMuted,
    marginTop: 2,
    textTransform: "uppercase",
  },
  conditionPill: {
    fontSize: 12,
    fontWeight: 700,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 3,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 3,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 5,
  },
  findingCard: {
    borderWidth: 1,
    borderColor: PDF_COLORS.border,
    borderRadius: 4,
    padding: 8,
    marginBottom: 6,
  },
  findingTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
});

function findLabel(options: readonly { value: string; label: string }[], value: string | null) {
  if (!value) return "-";
  return options.find((o) => o.value === value)?.label ?? value;
}

function formatCurrency(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export function ClientSummaryContent({ data }: { data: ReportData }) {
  const overall = conditionColor(data.overallCondition);
  const dateLabel = new Date(data.inspectionDate).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <View>
      {/* Data inspeksi & kendaraan */}
      <View style={[pdfStyles.card, styles.infoGrid]}>
        <View style={styles.infoCol}>
          <View style={pdfStyles.labelValueRow}>
            <Text style={pdfStyles.label}>No. Inspeksi</Text>
            <Text style={pdfStyles.value}>{data.inspectionNumber}</Text>
          </View>
          <View style={pdfStyles.labelValueRow}>
            <Text style={pdfStyles.label}>Tanggal</Text>
            <Text style={pdfStyles.value}>{dateLabel}</Text>
          </View>
          <View style={pdfStyles.labelValueRow}>
            <Text style={pdfStyles.label}>Lokasi</Text>
            <Text style={pdfStyles.value}>{data.inspectionLocation ?? "-"}</Text>
          </View>
          <View style={pdfStyles.labelValueRow}>
            <Text style={pdfStyles.label}>Inspector</Text>
            <Text style={pdfStyles.value}>{data.inspector.name}</Text>
          </View>
        </View>
        <View style={styles.infoCol}>
          <View style={pdfStyles.labelValueRow}>
            <Text style={pdfStyles.label}>Kendaraan</Text>
            <Text style={pdfStyles.value}>
              {data.vehicle.brand} {data.vehicle.model} {data.vehicle.manufactureYear ?? ""}
            </Text>
          </View>
          <View style={pdfStyles.labelValueRow}>
            <Text style={pdfStyles.label}>No. Polisi</Text>
            <Text style={pdfStyles.value}>{data.vehicle.plateNumber}</Text>
          </View>
          <View style={pdfStyles.labelValueRow}>
            <Text style={pdfStyles.label}>Kilometer</Text>
            <Text style={pdfStyles.value}>
              {data.vehicle.mileage ? `${data.vehicle.mileage.toLocaleString("id-ID")} km` : "-"}
            </Text>
          </View>
          <View style={pdfStyles.labelValueRow}>
            <Text style={pdfStyles.label}>Client</Text>
            <Text style={pdfStyles.value}>{data.client.name}</Text>
          </View>
        </View>
      </View>

      {/* Skor & Kondisi */}
      <View style={styles.scoreRow}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreValue}>{data.overallScore ?? "-"}/100</Text>
          <Text style={styles.scoreLabel}>Overall Score</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={[styles.conditionPill, { color: overall.fg, backgroundColor: overall.bg }]}>
            {findLabel(OVERALL_CONDITION_OPTIONS, data.overallCondition)}
          </Text>
          <Text style={styles.scoreLabel}>Overall Condition</Text>
        </View>
      </View>

      {/* Ringkasan kondisi item */}
      <Text style={pdfStyles.sectionTitle}>Condition Summary</Text>
      <View style={pdfStyles.card}>
        <View style={styles.summaryRow}>
          <View style={pdfStyles.row}>
            <View style={[styles.dot, { backgroundColor: PDF_COLORS.good }]} />
            <Text>Baik (Good)</Text>
          </View>
          <Text style={{ fontWeight: 700 }}>{data.conditionSummary.good} item</Text>
        </View>
        <View style={styles.summaryRow}>
          <View style={pdfStyles.row}>
            <View style={[styles.dot, { backgroundColor: PDF_COLORS.attention }]} />
            <Text>Perhatian (Attention)</Text>
          </View>
          <Text style={{ fontWeight: 700 }}>{data.conditionSummary.attention} item</Text>
        </View>
        <View style={styles.summaryRow}>
          <View style={pdfStyles.row}>
            <View style={[styles.dot, { backgroundColor: PDF_COLORS.problem }]} />
            <Text>Bermasalah (Problem)</Text>
          </View>
          <Text style={{ fontWeight: 700 }}>{data.conditionSummary.problem} item</Text>
        </View>
        {data.conditionSummary.na > 0 && (
          <View style={styles.summaryRow}>
            <View style={pdfStyles.row}>
              <View style={[styles.dot, { backgroundColor: PDF_COLORS.gray }]} />
              <Text>Tidak Berlaku (N/A)</Text>
            </View>
            <Text style={{ fontWeight: 700 }}>{data.conditionSummary.na} item</Text>
          </View>
        )}
      </View>

      {/* Final Assessment */}
      <Text style={pdfStyles.sectionTitle}>Final Assessment</Text>
      <View style={pdfStyles.card}>
        <View style={pdfStyles.labelValueRow}>
          <Text style={pdfStyles.label}>Accident Assessment</Text>
          <Text style={pdfStyles.value}>{findLabel(ACCIDENT_ASSESSMENT_OPTIONS, data.accidentAssessment)}</Text>
        </View>
        <View style={pdfStyles.labelValueRow}>
          <Text style={pdfStyles.label}>Flood Assessment</Text>
          <Text style={pdfStyles.value}>{findLabel(FLOOD_ASSESSMENT_OPTIONS, data.floodAssessment)}</Text>
        </View>
        <View style={pdfStyles.labelValueRow}>
          <Text style={pdfStyles.label}>Recommendation</Text>
          <Text style={pdfStyles.value}>{findLabel(FINAL_RECOMMENDATION_OPTIONS, data.finalRecommendation)}</Text>
        </View>
        {data.conclusion && (
          <View style={{ marginTop: 4 }}>
            <Text style={pdfStyles.label}>Conclusion</Text>
            <Text style={{ marginTop: 2 }}>{data.conclusion}</Text>
          </View>
        )}
      </View>

      {/* Important Findings */}
      <Text style={pdfStyles.sectionTitle}>
        Important Findings {data.importantFindings.length > 0 ? `(${data.importantFindings.length})` : ""}
      </Text>
      {data.importantFindings.length === 0 ? (
        <Text style={{ color: PDF_COLORS.textMuted }}>Tidak ada temuan penting.</Text>
      ) : (
        data.importantFindings.map((f, idx) => {
          const tone = conditionColor(f.severity === "PROBLEM" ? "PROBLEM" : "ATTENTION");
          return (
            <View key={idx} style={styles.findingCard}>
              <View style={styles.findingTitleRow}>
                <Text style={{ fontWeight: 700 }}>
                  {f.section} — {f.item}
                </Text>
                <Text style={{ color: tone.fg, fontWeight: 700, fontSize: 8 }}>
                  {SEVERITY_LABEL[f.severity] ?? f.severity}
                </Text>
              </View>
              {f.description && <Text style={{ marginBottom: 2 }}>{f.description}</Text>}
              {f.recommendation && (
                <Text style={{ color: PDF_COLORS.textMuted }}>Rekomendasi: {f.recommendation}</Text>
              )}
              {(f.estimatedCostMin || f.estimatedCostMax) && (
                <Text style={{ color: PDF_COLORS.textMuted, marginTop: 2 }}>
                  Estimasi biaya: {formatCurrency(f.estimatedCostMin ?? 0)} – {formatCurrency(f.estimatedCostMax ?? 0)}{" "}
                  (indikatif)
                </Text>
              )}
            </View>
          );
        })
      )}

      {(data.repairCostSummary.min > 0 || data.repairCostSummary.max > 0) && (
        <View style={[pdfStyles.card, { marginTop: 4, backgroundColor: "#F8FAFC" }]}>
          <View style={pdfStyles.labelValueRow}>
            <Text style={pdfStyles.label}>Total Estimasi Perbaikan</Text>
            <Text style={pdfStyles.value}>
              {formatCurrency(data.repairCostSummary.min)} – {formatCurrency(data.repairCostSummary.max)}
            </Text>
          </View>
          <Text style={{ color: PDF_COLORS.textMuted, fontSize: 7.5 }}>
            Angka bersifat indikatif, bukan quotation resmi bengkel.
          </Text>
        </View>
      )}
    </View>
  );
}
