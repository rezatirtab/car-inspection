import { requireRole } from "@/lib/auth/guards";
import { reviewInspection, InspectionNotReviewableError } from "@/services/inspections/reviewInspection";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;

    try {
      const inspection = await reviewInspection(id);
      return apiSuccess({ inspection });
    } catch (err) {
      if (err instanceof InspectionNotReviewableError) {
        return apiError("NOT_REVIEWABLE", err.message, 400);
      }
      throw err;
    }
  } catch (err) {
    return handleApiError(err);
  }
}
