import { requireRole } from "@/lib/auth/guards";
import { createSopItemSchema } from "@/lib/validation/schemas";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function POST(req: Request) {
  try {
    await requireRole("ADMIN");
    const body = createSopItemSchema.parse(await req.json());
    const item = await prisma.item.create({ data: body });
    return apiSuccess({ item }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
