import { requireAuth, requireInspectionAccess } from "@/lib/auth/guards";
import { finalAssessmentSchema } from "@/lib/validation/schemas";
import { prisma } from "@/lib/db/prisma";
import { computeInspectionSummary } from "@/services/inspections/getSummary";
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

    // System recommendation (draft) dihitung dari section score, tetapi
    // inspector tetap yang mengunci overallCondition (lihat TBD #2 di
    // dokumen: "system recommendation + inspector confirmation").
    const summary = await computeInspectionSummary(id);

    const finalAssessment = await prisma.finalAssessment.upsert({
      where: { inspectionId: id },
      update: {
        overallScore: summary.overallScore,
        overallCondition: body.overallCondition,
        accidentAssessment: body.accidentAssessment,
        floodAssessment: body.floodAssessment,
        finalRecommendation: body.finalRecommendation,
        conclusion: body.conclusion,
      },
      create: {
        inspectionId: id,
        overallScore: summary.overallScore,
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
