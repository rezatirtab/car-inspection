import { requireAuth, requireInspectionAccess } from "@/lib/auth/guards";
import { vehiclePhotoSchema } from "@/lib/validation/schemas";
import { prisma } from "@/lib/db/prisma";
import { deletePhoto } from "@/lib/storage";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    await requireInspectionAccess(session, id, "WRITE");

    const body = vehiclePhotoSchema.parse(await req.json());

    const existing = await prisma.inspection.findUniqueOrThrow({
      where: { id },
      select: { vehiclePhotoStorageKey: true },
    });

    const inspection = await prisma.inspection.update({
      where: { id },
      data: { vehiclePhotoStorageKey: body.storageKey },
      select: { id: true, vehiclePhotoStorageKey: true },
    });

    // Hapus foto lama kalau ada penggantian, biar tidak menumpuk file yatim.
    if (existing.vehiclePhotoStorageKey && existing.vehiclePhotoStorageKey !== body.storageKey) {
      try {
        await deletePhoto(existing.vehiclePhotoStorageKey);
      } catch {
        // sengaja diabaikan — kegagalan hapus file lama tidak boleh
        // menggagalkan penyimpanan foto baru
      }
    }

    return apiSuccess({ inspection });
  } catch (err) {
    return handleApiError(err);
  }
}