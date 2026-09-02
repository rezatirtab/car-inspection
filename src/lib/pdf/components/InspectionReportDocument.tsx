import { Document, Page } from "@react-pdf/renderer";
import { pdfStyles } from "../theme";
import { ReportHeader, ReportFooter } from "./ReportHeader";
import { ClientSummaryContent } from "./ClientSummaryContent";
import { DetailedChecklistContent } from "./DetailedChecklistContent";
import { EvidenceAppendixContent } from "./EvidenceAppendixContent";
import type { ReportData, DetailedReportSection, EvidencePhoto } from "@/types/report";
import { REPORT_TYPE_LABEL } from "@/config/constants";

/**
 * Mengikuti REPORT HIERARCHY pada SOP: Summary First, Detail Second,
 * Evidence Third. Setiap report type menampilkan bagian yang berbeda:
 * - CLIENT_SUMMARY   -> hanya Summary
 * - DETAILED_REPORT  -> Summary + Detailed Checklist
 * - FULL_REPORT      -> Summary + Detailed Checklist + Evidence Appendix
 */
export function InspectionReportDocument({
  data,
  type,
  detailedSections,
  evidencePhotos,
}: {
  data: ReportData;
  type: "CLIENT_SUMMARY" | "DETAILED_REPORT" | "FULL_REPORT";
  detailedSections?: DetailedReportSection[];
  evidencePhotos?: EvidencePhoto[];
}) {
  const title = REPORT_TYPE_LABEL[type] ?? "Vehicle Inspection Report";

  return (
    <Document
      title={`${data.inspectionNumber} — ${title}`}
      author="Vehicle Inspection Management System"
    >
      <Page size="A4" style={pdfStyles.page} wrap>
        <ReportHeader title="Vehicle Inspection Report" />
        <ClientSummaryContent data={data} />
        <ReportFooter inspectionNumber={data.inspectionNumber} />
      </Page>

      {(type === "DETAILED_REPORT" || type === "FULL_REPORT") && detailedSections && (
        <Page size="A4" style={pdfStyles.page} wrap>
          <ReportHeader title="Detailed Inspection Report" />
          <DetailedChecklistContent sections={detailedSections} />
          <ReportFooter inspectionNumber={data.inspectionNumber} />
        </Page>
      )}

      {type === "FULL_REPORT" && evidencePhotos && (
        <Page size="A4" style={pdfStyles.page} wrap>
          <ReportHeader title="Evidence Appendix" />
          <EvidenceAppendixContent photos={evidencePhotos} />
          <ReportFooter inspectionNumber={data.inspectionNumber} />
        </Page>
      )}
    </Document>
  );
}
