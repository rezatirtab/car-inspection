import { prisma } from "@/lib/db/prisma";
import { buildReportData } from "./buildSummary";
import { buildDetailedReport } from "./buildDetailedReport";
import { buildEvidencePhotos } from "./buildEvidence";
import { renderInspectionReportPdf } from "@/lib/pdf";
import { uploadReport } from "@/lib/storage";
import type { ReportType } from "@prisma/client";

/**
 * Alur: Inspection -> Report Data Builder -> Report Template -> PDF Renderer
 * -> Storage -> Report record. Setiap generate ulang akan menambah versi
 * baru (Report Versioning) — file lama tidak ditimpa tanpa jejak.
 *
 * Isi PDF mengikuti REPORT HIERARCHY di SOP ("Summary First, Detail
 * Second, Evidence Third"):
 *   CLIENT_SUMMARY   -> Summary saja
 *   DETAILED_REPORT  -> Summary + Detailed Checklist
 *   FULL_REPORT      -> Summary + Detailed Checklist + Evidence Appendix (foto)
 */
export async function generateReport(inspectionId: string, type: ReportType) {
  const inspection = await prisma.inspection.findUniqueOrThrow({
    where: { id: inspectionId },
  });

  if (inspection.status !== "COMPLETED" && inspection.status !== "REVIEWED") {
    throw new Error(
      "Report hanya dapat dibuat untuk inspeksi berstatus COMPLETED atau REVIEWED."
    );
  }

  const data = await buildReportData(inspectionId);

  const detailedSections =
    type === "DETAILED_REPORT" || type === "FULL_REPORT"
      ? await buildDetailedReport(inspectionId)
      : undefined;

  const evidencePhotos = type === "FULL_REPORT" ? await buildEvidencePhotos(inspectionId) : undefined;

  const pdfBuffer = await renderInspectionReportPdf({
    data,
    type,
    detailedSections,
    evidencePhotos,
  });

  const lastVersion = await prisma.inspectionReport.findFirst({
    where: { inspectionId, reportType: type },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  const version = (lastVersion?.version ?? 0) + 1;

  const fileName = `${inspection.inspectionNumber}-${type.toLowerCase()}-v${version}.pdf`;
  const fileKey = `reports/${inspection.id}/${fileName}`;

  await uploadReport(fileKey, pdfBuffer);

  return prisma.inspectionReport.create({
    data: {
      inspectionId,
      reportType: type,
      fileKey,
      fileName,
      version,
    },
  });
}
