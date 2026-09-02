import { requireAuth, requireRole } from "@/lib/auth/guards";
import { createSopSectionSchema } from "@/lib/validation/schemas";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAuth();
    const sections = await prisma.inspectionSection.findMany({
      orderBy: { displayOrder: "asc" },
      include: { items: { orderBy: { displayOrder: "asc" } } },
    });
    return apiSuccess({ sections });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireRole("ADMIN");
    const body = createSopSectionSchema.parse(await req.json());
    const section = await prisma.inspectionSection.create({ data: body });
    return apiSuccess({ section }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
