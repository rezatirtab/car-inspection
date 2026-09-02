import { requireAuth, requireInspectionAccess } from "@/lib/auth/guards";
import { generateReportSchema } from "@/lib/validation/schemas";
import { generateReport } from "@/services/reports/generateReport";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    await requireInspectionAccess(session, id, "READ");

    const body = generateReportSchema.parse(await req.json());
    const report = await generateReport(id, body.type);

    return apiSuccess({ report }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
