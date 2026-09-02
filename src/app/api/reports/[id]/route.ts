import { requireAuth, requireInspectionAccess } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { getReportUrl } from "@/lib/storage";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const report = await prisma.inspectionReport.findUnique({ where: { id } });
    if (!report) {
      return apiError("NOT_FOUND", "Report tidak ditemukan.", 404);
    }

    await requireInspectionAccess(session, report.inspectionId, "READ");
    const downloadUrl = await getReportUrl(report.fileKey);

    return apiSuccess({
      id: report.id,
      fileName: report.fileName,
      version: report.version,
      downloadUrl,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
