import { prisma } from "@/lib/db/prisma";
import { computeInspectionSummary } from "@/services/inspections/getSummary";
import { buildFindings } from "./buildFindings";
import { getPhotoBuffer } from "@/lib/storage";
import type { ReportData } from "@/types/report";

/**
 * Menyusun seluruh data yang dibutuhkan untuk generate report (Client
 * Summary maupun Detailed Report) dari satu inspeksi. Fungsi ini TIDAK
 * merender PDF — hanya mengumpulkan & menghitung data (lihat
 * services/reports/generateReport.ts untuk alur lengkap sampai PDF).
 */
export async function buildReportData(inspectionId: string): Promise<ReportData> {
  const inspection = await prisma.inspection.findUniqueOrThrow({
    where: { id: inspectionId },
    include: {
      client: true,
      vehicle: true,
      inspector: { select: { name: true } },
      finalAssessment: true,
      sectionSnapshots: {
        orderBy: { displayOrder: "asc" },
        include: { sectionResults: true },
      },
    },
  });

  const summary = await computeInspectionSummary(inspectionId);
  const findings = await buildFindings(inspectionId);

  // Untuk PDF, kita butuh ISI FILE (Buffer), bukan URL — react-pdf
  // merender di server dan tidak selalu bisa fetch balik ke URL relatif
  // milik aplikasi sendiri. Ambil hanya foto PERTAMA tiap finding sebagai
  // thumbnail kecil di ringkasan (foto lengkap tetap ada di halaman
  // Evidence Appendix terpisah untuk FULL_REPORT).
  const findingsWithThumbnail = await Promise.all(
    findings.map(async (f) => ({
      section: f.section,
      item: f.item,
      severity: f.severity,
      description: f.description,
      recommendation: f.recommendation,
      estimatedCostMin: f.estimatedCostMin,
      estimatedCostMax: f.estimatedCostMax,
      thumbnail: f.photoStorageKeys[0] ? await getPhotoBuffer(f.photoStorageKeys[0]) : null,
    }))
  );

  const vehiclePhoto = inspection.vehiclePhotoStorageKey
    ? await getPhotoBuffer(inspection.vehiclePhotoStorageKey)
    : null;

  const repairCostSummary = findings.reduce(
    (acc, f) => ({
      min: acc.min + (f.estimatedCostMin ?? 0),
      max: acc.max + (f.estimatedCostMax ?? 0),
    }),
    { min: 0, max: 0 }
  );

  return {
    inspectionId: inspection.id,
    inspectionNumber: inspection.inspectionNumber,
    inspectionDate: inspection.inspectionDate.toISOString(),
    inspectionLocation: inspection.inspectionLocation,
    inspector: { name: inspection.inspector.name },
    client: {
      name: inspection.client.name,
      phone: inspection.client.phone,
      email: inspection.client.email,
    },
    vehicle: {
      plateNumber: inspection.vehicle.plateNumber,
      brand: inspection.vehicle.brand,
      model: inspection.vehicle.model,
      manufactureYear: inspection.vehicle.manufactureYear,
      mileage: inspection.vehicle.mileage,
    },
    vehiclePhoto,
    overallScore: inspection.finalAssessment?.overallScore
      ? Number(inspection.finalAssessment.overallScore)
      : summary.overallScore,
    overallCondition: inspection.finalAssessment?.overallCondition ?? null,
    accidentAssessment: inspection.finalAssessment?.accidentAssessment ?? null,
    floodAssessment: inspection.finalAssessment?.floodAssessment ?? null,
    finalRecommendation: inspection.finalAssessment?.finalRecommendation ?? null,
    conclusion: inspection.finalAssessment?.conclusion ?? null,
    conditionSummary: summary.conditionSummary,
    sections: summary.sectionSummaries.map((s) => {
      const sectionResult = inspection.sectionSnapshots
        .find((ss) => ss.id === s.sectionSnapshotId)
        ?.sectionResults?.[0];
      return {
        code: s.code,
        name: s.name,
        good: s.good,
        attention: s.attention,
        problem: s.problem,
        na: s.na,
        score: sectionResult?.sectionScore ? Number(sectionResult.sectionScore) : s.score,
        conclusion: sectionResult?.conclusion ?? null,
      };
    }),
    importantFindings: findingsWithThumbnail,
    repairCostSummary,
  };
}
