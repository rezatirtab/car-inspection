import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { requireAuth } from "@/lib/auth/guards";
import { apiError, handleApiError } from "@/lib/api-response";

/**
 * Implementasi LOCAL FILESYSTEM untuk lib/storage (hanya untuk development).
 * File disimpan di ./uploads (di luar public/, tidak boleh diakses langsung
 * tanpa lewat endpoint ini). Untuk production, ganti lib/storage/index.ts
 * dengan SDK provider object storage (S3/R2/Supabase) dan hapus route ini.
 */
const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

function resolveSafePath(keyParts: string[]) {
  const target = path.join(UPLOAD_ROOT, ...keyParts);
  if (!target.startsWith(UPLOAD_ROOT)) {
    throw new Error("Path tidak valid.");
  }
  return target;
}

const MIME_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
};

function guessContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_BY_EXTENSION[ext] ?? "application/octet-stream";
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    await requireAuth();
    const { key } = await params;
    const filePath = resolveSafePath(key);

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const arrayBuffer = await req.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    await requireAuth();
    const { key } = await params;
    const filePath = resolveSafePath(key);

    const fileBuffer = await fs.readFile(filePath);
    return new Response(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": guessContentType(filePath),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return apiError("NOT_FOUND", "File tidak ditemukan.", 404);
  }
}
