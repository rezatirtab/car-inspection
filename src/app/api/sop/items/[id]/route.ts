import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { updateSopItemSchema } from "@/lib/validation/schemas";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;
    const body = updateSopItemSchema.parse(await req.json());
    const item = await prisma.item.update({ where: { id }, data: body });
    return apiSuccess({ item });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;
    // Soft delete — jangan hard delete supaya snapshot lama tetap valid
    // secara referensial dan riwayat perubahan SOP tetap terlacak.
    const item = await prisma.item.update({
      where: { id },
      data: { isActive: false },
    });
    return apiSuccess({ item });
  } catch (err) {
    return handleApiError(err);
  }
}
