import { requireAuth, requireInspectionAccess } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { deletePhoto } from "@/lib/storage";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const photo = await prisma.inspectionPhoto.findUnique({ where: { id } });
    if (!photo) {
      return apiError("NOT_FOUND", "Foto tidak ditemukan.", 404);
    }

    await requireInspectionAccess(session, photo.inspectionId, "WRITE");

    await prisma.inspectionPhoto.delete({ where: { id } });
    // Hapus filenya juga — kalau gagal (mis. file sudah tidak ada), jangan
    // gagalkan seluruh request karena metadata sudah terlanjur terhapus.
    try {
      await deletePhoto(photo.storageKey);
    } catch {
      // sengaja diabaikan
    }

    return apiSuccess({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
