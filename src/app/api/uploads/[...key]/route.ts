import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { apiError, handleApiError } from "@/lib/api-response";
import { uploadPhoto, getPhotoBuffer } from "@/lib/storage";

function guessContentType(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    pdf: "application/pdf",
  };
  return map[ext] ?? "application/octet-stream";
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    await requireAuth();
    const { key } = await params;
    const storageKey = key.join("/");

    const arrayBuffer = await req.arrayBuffer();
    const contentType = req.headers.get("content-type") ?? guessContentType(storageKey);
    await uploadPhoto(storageKey, Buffer.from(arrayBuffer), contentType);

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
    const storageKey = key.join("/");

    const fileBuffer = await getPhotoBuffer(storageKey);
    if (!fileBuffer) {
      return apiError("NOT_FOUND", "File tidak ditemukan.", 404);
    }

    return new Response(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": guessContentType(storageKey),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return apiError("NOT_FOUND", "File tidak ditemukan.", 404);
  }
}