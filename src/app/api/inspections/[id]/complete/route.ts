import { requireAuth, requireInspectionAccess } from "@/lib/auth/guards";
import {
  completeInspection,
  InspectionIncompleteError,
} from "@/services/inspections/completeInspection";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    await requireInspectionAccess(session, id, "WRITE");

    try {
      const inspection = await completeInspection(id);
      return apiSuccess({ inspection });
    } catch (err) {
      if (err instanceof InspectionIncompleteError) {
        return apiError(
          "INSPECTION_INCOMPLETE",
          "Inspeksi belum dapat diselesaikan — masih ada item yang wajib diisi.",
          400,
          err.missing
        );
      }
      throw err;
    }
  } catch (err) {
    return handleApiError(err);
  }
}
