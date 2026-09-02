/**
 * PDF GENERATION
 * ------------------------------------------------------------------
 * Implementasi menggunakan @react-pdf/renderer — dipilih karena berbasis
 * React (selaras dengan stack Next.js proyek ini) dan bisa merender PDF
 * di server (Node.js) tanpa browser headless (lebih ringan dari Puppeteer).
 *
 * Struktur halaman mengikuti REPORT HIERARCHY pada SOP:
 * "Summary First, Detail Second, Evidence Third" — lihat
 * components/InspectionReportDocument.tsx.
 */
import { renderToBuffer } from "@react-pdf/renderer";
import { InspectionReportDocument } from "./components/InspectionReportDocument";
import type {
  ReportData,
  DetailedReportSection,
  EvidencePhoto,
} from "@/types/report";
import type { ReportType } from "@prisma/client";

export type RenderReportInput = {
  data: ReportData;
  type: ReportType;
  detailedSections?: DetailedReportSection[];
  evidencePhotos?: EvidencePhoto[];
};

export async function renderInspectionReportPdf(
  input: RenderReportInput
): Promise<Buffer> {
  const buffer = await renderToBuffer(
    <InspectionReportDocument
      data={input.data}
      type={input.type}
      detailedSections={input.detailedSections}
      evidencePhotos={input.evidencePhotos}
    />
  );
  return Buffer.from(buffer);
}
