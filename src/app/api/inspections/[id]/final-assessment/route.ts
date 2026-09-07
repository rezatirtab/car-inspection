import { requireAuth, requireInspectionAccess } from "@/lib/auth/guards";
import { finalAssessmentSchema } from "@/lib/validation/schemas";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    await requireInspectionAccess(session, id, "WRITE");

    const body = finalAssessmentSchema.parse(await req.json());

    // Catatan: overallScore sekarang diisi MANUAL oleh inspector
    // (body.overallScore), bukan lagi dipaksa dari hasil perhitungan
    // otomatis. Fungsi computeInspectionSummary tetap dipertahankan di
    // codebase (dipakai di tempat lain / bisa diaktifkan lagi nanti kalau
    // dibutuhkan), tapi tidak lagi menimpa nilai overallScore final.
    const finalAssessment = await prisma.finalAssessment.upsert({
      where: { inspectionId: id },
      update: {
        overallScore: body.overallScore,
        overallCondition: body.overallCondition,
        accidentAssessment: body.accidentAssessment,
        floodAssessment: body.floodAssessment,
        finalRecommendation: body.finalRecommendation,
        conclusion: body.conclusion,
      },
      create: {
        inspectionId: id,
        overallScore: body.overallScore,
        overallCondition: body.overallCondition,
        accidentAssessment: body.accidentAssessment,
        floodAssessment: body.floodAssessment,
        finalRecommendation: body.finalRecommendation,
        conclusion: body.conclusion,
      },
    });

    return apiSuccess({ finalAssessment });
  } catch (err) {
    return handleApiError(err);
  }
}
