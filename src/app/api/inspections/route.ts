import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { createInspectionSchema } from "@/lib/validation/schemas";
import { createInspection } from "@/services/inspections/createInspection";
import { listInspections } from "@/services/inspections/getInspection";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as
      | "DRAFT"
      | "IN_PROGRESS"
      | "COMPLETED"
      | "REVIEWED"
      | "CANCELLED"
      | null;

    // Inspector hanya melihat inspeksinya sendiri; Admin melihat semua.
    const inspections = await listInspections({
      inspectorId: session.role === "INSPECTOR" ? session.userId : undefined,
      status: status ?? undefined,
    });

    return apiSuccess({ inspections });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = createInspectionSchema.parse(await req.json());

    const inspection = await createInspection({
      clientId: body.clientId,
      vehicleId: body.vehicleId,
      inspectorId: session.userId,
      inspectionLocation: body.inspectionLocation,
    });

    return apiSuccess({ inspection }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
