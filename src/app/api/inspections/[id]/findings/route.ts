import { requireAuth, requireInspectionAccess } from "@/lib/auth/guards";
import { createFindingSchema } from "@/lib/validation/schemas";
import { createFinding } from "@/services/findings/findingService";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    await requireInspectionAccess(session, id, "WRITE");

    const body = createFindingSchema.parse(await req.json());
    const finding = await createFinding(id, body);

    return apiSuccess({ finding }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
