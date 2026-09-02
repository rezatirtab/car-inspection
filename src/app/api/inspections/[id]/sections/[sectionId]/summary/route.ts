import { requireAuth, requireInspectionAccess } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { id, sectionId } = await params;
    const session = await requireAuth();
    await requireInspectionAccess(session, id, "READ");

    const section = await prisma.sectionSnapshot.findUnique({
      where: { id: sectionId },
      include: { items: { include: { result: true } } },
    });

    if (!section || section.inspectionId !== id) {
      return apiError("NOT_FOUND", "Section tidak ditemukan.", 404);
    }

    let good = 0;
    let attention = 0;
    let problem = 0;
    let na = 0;
    let findings = 0;

    for (const item of section.items) {
      if (item.result?.condition === "GOOD") good++;
      if (item.result?.condition === "ATTENTION") attention++;
      if (item.result?.condition === "PROBLEM") problem++;
      if (item.result?.condition === "NA") na++;
      if (item.result?.isFinding) findings++;
    }

    return apiSuccess({
      section: section.name,
      total: section.items.length,
      good,
      attention,
      problem,
      na,
      findings,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
