import { requireAuth, requireInspectionAccess } from "@/lib/auth/guards";
import { getInspectionDetail } from "@/services/inspections/getInspection";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    await requireInspectionAccess(session, id, "READ");

    const inspection = await getInspectionDetail(id);
    if (!inspection) {
      return apiError("NOT_FOUND", "Inspeksi tidak ditemukan.", 404);
    }

    return apiSuccess({ inspection });
  } catch (err) {
    return handleApiError(err);
  }
}
