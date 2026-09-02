import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await requireAuth();
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, role: true, phone: true },
    });
    return apiSuccess({ user });
  } catch (err) {
    return handleApiError(err);
  }
}
