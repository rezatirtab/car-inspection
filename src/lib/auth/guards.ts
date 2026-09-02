import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { SESSION_COOKIE, verifySessionToken, type SessionPayload } from "./session";

export class AuthError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 401) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

/**
 * Mengambil session user dari cookie. Mengembalikan null jika tidak login.
 * Ini fungsi dasar — gunakan requireAuth() jika endpoint WAJIB login.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE.name)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Melempar AuthError jika user belum login. */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new AuthError("UNAUTHENTICATED", "Anda harus login terlebih dahulu.", 401);
  }
  return session;
}

/** Melempar AuthError jika role user tidak termasuk yang diizinkan. */
export async function requireRole(
  ...roles: Array<"ADMIN" | "INSPECTOR">
): Promise<SessionPayload> {
  const session = await requireAuth();
  if (!roles.includes(session.role)) {
    throw new AuthError(
      "FORBIDDEN",
      "Anda tidak memiliki akses untuk melakukan aksi ini.",
      403
    );
  }
  return session;
}

/**
 * Memastikan inspector hanya bisa mengakses inspeksi miliknya sendiri.
 * Admin dapat mengakses semua inspeksi.
 * Setelah status COMPLETED, inspector hanya READ (tidak boleh WRITE).
 */
export async function requireInspectionAccess(
  session: SessionPayload,
  inspectionId: string,
  mode: "READ" | "WRITE" = "READ"
) {
  const inspection = await prisma.inspection.findUnique({
    where: { id: inspectionId },
    select: { id: true, inspectorId: true, status: true },
  });

  if (!inspection) {
    throw new AuthError("NOT_FOUND", "Inspeksi tidak ditemukan.", 404);
  }

  if (session.role === "ADMIN") {
    return inspection;
  }

  if (inspection.inspectorId !== session.userId) {
    throw new AuthError(
      "FORBIDDEN",
      "Anda hanya dapat mengakses inspeksi milik Anda sendiri.",
      403
    );
  }

  if (mode === "WRITE" && inspection.status === "COMPLETED") {
    throw new AuthError(
      "INSPECTION_LOCKED",
      "Inspeksi yang sudah selesai (COMPLETED) tidak dapat diubah oleh Inspector. Hubungi Admin/Reviewer.",
      403
    );
  }

  return inspection;
}
