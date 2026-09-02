import { requireAuth } from "@/lib/auth/guards";
import { updateFindingSchema } from "@/lib/validation/schemas";
import { updateFinding, deleteFinding } from "@/services/findings/findingService";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = updateFindingSchema.parse(await req.json());
    const finding = await updateFinding(id, body);
    return apiSuccess({ finding });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    await deleteFinding(id);
    return apiSuccess({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
