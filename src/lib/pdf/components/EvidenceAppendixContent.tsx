import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { pdfStyles, conditionColor, PDF_COLORS } from "../theme";
import type { EvidencePhoto } from "@/types/report";
import { SEVERITY_LABEL } from "@/config/constants";

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  photoCard: {
    width: 160,
    marginBottom: 10,
  },
  photo: {
    width: 160,
    height: 110,
    objectFit: "cover",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: PDF_COLORS.border,
  },
  caption: {
    fontSize: 7.5,
    marginTop: 3,
  },
});

export function EvidenceAppendixContent({ photos }: { photos: EvidencePhoto[] }) {
  if (photos.length === 0) {
    return (
      <View>
        <Text style={pdfStyles.sectionTitle}>Evidence Appendix</Text>
        <Text style={{ color: PDF_COLORS.textMuted }}>Tidak ada foto bukti terlampir.</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={pdfStyles.sectionTitle}>Evidence Appendix</Text>
      <View style={styles.grid}>
        {photos.map((p, idx) => {
          const tone = conditionColor(p.severity === "PROBLEM" ? "PROBLEM" : "ATTENTION");
          return (
            <View key={idx} style={styles.photoCard} wrap={false}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={p.buffer} style={styles.photo} />
              <Text style={[styles.caption, { fontWeight: 700 }]}>
                {p.section} — {p.item}
              </Text>
              <Text style={[styles.caption, { color: tone.fg }]}>
                {SEVERITY_LABEL[p.severity] ?? p.severity}
              </Text>
              {p.caption && <Text style={styles.caption}>{p.caption}</Text>}
            </View>
          );
        })}
      </View>
    </View>
  );
}
