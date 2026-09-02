import { prisma } from "@/lib/db/prisma";
import { DRAFT_CONDITION_SCORE } from "@/config/constants";

/**
 * PERINGATAN: formula scoring di sini masih DRAFT (lihat README bagian
 * "Keputusan & Asumsi" dan dokumen SOP bagian 16-18/24 "Scoring System —
 * Draft"). Setiap item bobotnya disamakan (tanpa weight per item) dan
 * N/A dikecualikan dari perhitungan, bukan dihitung sebagai 0 — sesuai
 * Rule 8 ("N/A does not count as a defect").
 * Ganti isi fungsi ini saat formula resmi sudah disepakati SOP perusahaan.
 */
export async function computeInspectionSummary(inspectionId: string) {
  const sectionSnapshots = await prisma.sectionSnapshot.findMany({
    where: { inspectionId },
    orderBy: { displayOrder: "asc" },
    include: {
      items: {
        include: { result: true },
      },
    },
  });

  let totalGood = 0;
  let totalAttention = 0;
  let totalProblem = 0;
  let totalNa = 0;

  const sectionSummaries = sectionSnapshots.map((section) => {
    let good = 0;
    let attention = 0;
    let problem = 0;
    let na = 0;
    let scoreSum = 0;
    let scoreCount = 0;

    for (const item of section.items) {
      const condition = item.result?.condition;
      if (!condition) continue; // belum diisi
      if (condition === "GOOD") good++;
      if (condition === "ATTENTION") attention++;
      if (condition === "PROBLEM") problem++;
      if (condition === "NA") na++;

      const score = DRAFT_CONDITION_SCORE[condition];
      if (score >= 0) {
        scoreSum += score;
        scoreCount++;
      }
    }

    totalGood += good;
    totalAttention += attention;
    totalProblem += problem;
    totalNa += na;

    return {
      sectionSnapshotId: section.id,
      code: section.code,
      name: section.name,
      good,
      attention,
      problem,
      na,
      score: scoreCount > 0 ? Math.round(scoreSum / scoreCount) : null,
    };
  });

  const scoredSections = sectionSummaries.filter((s) => s.score !== null);
  const overallScore =
    scoredSections.length > 0
      ? Math.round(
          scoredSections.reduce((sum, s) => sum + (s.score ?? 0), 0) /
            scoredSections.length
        )
      : null;

  return {
    sectionSummaries,
    conditionSummary: {
      good: totalGood,
      attention: totalAttention,
      problem: totalProblem,
      na: totalNa,
    },
    overallScore,
  };
}
