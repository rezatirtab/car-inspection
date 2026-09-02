import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { createVehicleSchema } from "@/lib/validation/schemas";
import { listVehicles, createVehicle } from "@/services/vehicles/vehicleService";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const search = req.nextUrl.searchParams.get("search") ?? undefined;
    const vehicles = await listVehicles(search);
    return apiSuccess({ vehicles });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const body = createVehicleSchema.parse(await req.json());
    const vehicle = await createVehicle(body);
    return apiSuccess({ vehicle }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
