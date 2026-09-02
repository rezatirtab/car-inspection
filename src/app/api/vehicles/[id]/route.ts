import { requireAuth } from "@/lib/auth/guards";
import { updateVehicleSchema } from "@/lib/validation/schemas";
import { getVehicle, updateVehicle } from "@/services/vehicles/vehicleService";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const vehicle = await getVehicle(id);
    if (!vehicle) return apiError("NOT_FOUND", "Kendaraan tidak ditemukan.", 404);
    return apiSuccess({ vehicle });
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
    const body = updateVehicleSchema.parse(await req.json());
    const vehicle = await updateVehicle(id, body);
    return apiSuccess({ vehicle });
  } catch (err) {
    return handleApiError(err);
  }
}
