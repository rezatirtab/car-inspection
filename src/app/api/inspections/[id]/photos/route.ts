import { requireAuth, requireInspectionAccess } from "@/lib/auth/guards";
import { photoMetadataSchema } from "@/lib/validation/schemas";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    await requireInspectionAccess(session, id, "WRITE");

    const body = photoMetadataSchema.parse(await req.json());

    const photo = await prisma.inspectionPhoto.create({
      data: {
        inspectionId: id,
        resultId: body.resultId,
        findingId: body.findingId,
        storageKey: body.storageKey,
        fileName: body.fileName,
        mimeType: body.mimeType,
        fileSize: body.fileSize,
        width: body.width,
        height: body.height,
      },
    });

    return apiSuccess({ photo }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
