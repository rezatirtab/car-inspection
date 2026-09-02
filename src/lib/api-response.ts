import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth/guards";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  details: unknown[] = []
) {
  return NextResponse.json(
    { success: false, error: { code, message, details } },
    { status }
  );
}

/**
 * Menangani error umum (Zod, AuthError, error tak terduga) dan mengubahnya
 * menjadi response JSON yang konsisten. Dipakai di setiap route handler:
 *
 *   try { ... } catch (err) { return handleApiError(err); }
 */
export function handleApiError(err: unknown) {
  if (err instanceof ZodError) {
    return apiError(
      "VALIDATION_ERROR",
      "Data yang dikirim tidak valid.",
      400,
      err.issues.map((i) => ({ path: i.path.join("."), message: i.message }))
    );
  }
  if (err instanceof AuthError) {
    return apiError(err.code, err.message, err.status);
  }
  console.error(err);
  return apiError(
    "INTERNAL_ERROR",
    "Terjadi kesalahan pada server. Silakan coba lagi.",
    500
  );
}
