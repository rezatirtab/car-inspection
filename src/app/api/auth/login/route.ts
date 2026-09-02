import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validation/schemas";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = loginSchema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !user.isActive) {
      return apiError("INVALID_CREDENTIALS", "Email atau password salah.", 401);
    }

    const isValid = await bcrypt.compare(body.password, user.passwordHash);
    if (!isValid) {
      return apiError("INVALID_CREDENTIALS", "Email atau password salah.", 401);
    }

    const token = await createSessionToken({
      userId: user.id,
      role: user.role,
      name: user.name,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE.name, token, SESSION_COOKIE.options);

    return apiSuccess({
      user: { id: user.id, name: user.name, role: user.role, email: user.email },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
