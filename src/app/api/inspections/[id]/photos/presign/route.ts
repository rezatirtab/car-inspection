import { requireAuth, requireInspectionAccess } from "@/lib/auth/guards";
import { getPresignedUploadUrl } from "@/lib/storage";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { z } from "zod";

const presignSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    await requireInspectionAccess(session, id, "WRITE");

    const body = presignSchema.parse(await req.json());
    const presigned = await getPresignedUploadUrl({
      inspectionId: id,
      fileName: body.fileName,
      mimeType: body.mimeType,
    });

    return apiSuccess(presigned);
  } catch (err) {
    return handleApiError(err);
  }
}
