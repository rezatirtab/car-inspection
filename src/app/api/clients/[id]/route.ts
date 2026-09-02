import { requireAuth } from "@/lib/auth/guards";
import { updateClientSchema } from "@/lib/validation/schemas";
import { getClient, updateClient } from "@/services/clients/clientService";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const client = await getClient(id);
    if (!client) return apiError("NOT_FOUND", "Client tidak ditemukan.", 404);
    return apiSuccess({ client });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = updateClientSchema.parse(await req.json());
    const client = await updateClient(id, body);
    return apiSuccess({ client });
  } catch (err) {
    return handleApiError(err);
  }
}
