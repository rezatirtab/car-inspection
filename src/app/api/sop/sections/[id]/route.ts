import { requireAuth, requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { updateSopSectionSchema } from "@/lib/validation/schemas";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const section = await prisma.inspectionSection.findUnique({
      where: { id },
      include: { items: { orderBy: { displayOrder: "asc" } } },
    });
    if (!section) return apiError("NOT_FOUND", "Section tidak ditemukan.", 404);
    return apiSuccess({ section });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;
    const body = updateSopSectionSchema.parse(await req.json());
    const section = await prisma.inspectionSection.update({
      where: { id },
      data: body,
    });
    return apiSuccess({ section });
  } catch (err) {
    return handleApiError(err);
  }
}
