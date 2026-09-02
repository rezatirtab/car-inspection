import { requireAuth, requireInspectionAccess } from "@/lib/auth/guards";
import { updateInspectionResultSchema } from "@/lib/validation/schemas";
import { updateInspectionResult } from "@/services/inspections/updateResult";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    const session = await requireAuth();
    await requireInspectionAccess(session, id, "WRITE");

    const body = updateInspectionResultSchema.parse(await req.json());

    try {
      const result = await updateInspectionResult(id, itemId, body);
      return apiSuccess({ result });
    } catch (err) {
      if (err instanceof Error && err.message === "NOTES_REQUIRED_FOR_PROBLEM") {
        return apiError(
          "NOTES_REQUIRED",
          "Notes wajib diisi untuk kondisi PROBLEM (merah).",
          400
        );
      }
      if (err instanceof Error && err.message === "ITEM_NOT_FOUND") {
        return apiError("NOT_FOUND", "Item inspeksi tidak ditemukan.", 404);
      }
      throw err;
    }
  } catch (err) {
    return handleApiError(err);
  }
}
