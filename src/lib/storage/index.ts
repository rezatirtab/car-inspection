/**
 * STORAGE ABSTRACTION
 * ------------------------------------------------------------------
 * Komponen lain di aplikasi TIDAK BOLEH memanggil S3/R2/Supabase secara
 * langsung — semua akses foto & PDF lewat modul ini. Dengan begitu,
 * mengganti provider storage cukup mengganti isi file ini saja (dan
 * menghapus route /api/uploads/[...key] yang khusus untuk mode lokal).
 *
 * Implementasi saat ini: LOCAL FILESYSTEM (untuk development), menyimpan
 * file ke folder `uploads/` di root proyek (di luar `public/`, tidak bisa
 * diakses langsung tanpa lewat endpoint /api/uploads/[...key] yang sudah
 * ada pengecekan auth-nya).
 *
 * Untuk production, ganti isi fungsi di bawah dengan SDK provider pilihan
 * (contoh: @aws-sdk/client-s3 untuk S3/R2, atau @supabase/supabase-js).
 * Environment variable yang disiapkan: STORAGE_ENDPOINT, STORAGE_REGION,
 * STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY, STORAGE_BUCKET (lihat .env.example).
 */
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

export type PresignedUpload = {
  uploadUrl: string;
  storageKey: string;
  method: "PUT" | "POST";
};

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

function resolveSafePath(storageKey: string): string {
  const target = path.join(UPLOAD_ROOT, storageKey);
  if (!target.startsWith(UPLOAD_ROOT)) {
    throw new Error("storageKey tidak valid.");
  }
  return target;
}

/**
 * Menghasilkan URL upload langsung ke storage (presigned), agar file besar
 * tidak melewati server Next.js. Untuk implementasi LOCAL ini disederhanakan
 * menjadi endpoint upload sendiri: PUT /api/uploads/:storageKey.
 */
export async function getPresignedUploadUrl(params: {
  inspectionId: string;
  fileName: string;
  mimeType: string;
}): Promise<PresignedUpload> {
  const storageKey = `inspections/${params.inspectionId}/${randomUUID()}-${params.fileName}`;
  return {
    uploadUrl: `/api/uploads/${encodeURIComponent(storageKey)}`,
    storageKey,
    method: "PUT",
  };
}

export async function uploadPhoto(
  storageKey: string,
  fileBuffer: Buffer,
  _mimeType: string
): Promise<void> {
  const filePath = resolveSafePath(storageKey);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, fileBuffer);
}

export async function deletePhoto(storageKey: string): Promise<void> {
  const filePath = resolveSafePath(storageKey);
  await fs.rm(filePath, { force: true });
}

export async function getPhotoUrl(storageKey: string): Promise<string> {
  // TODO(production): kembalikan signed URL dengan masa berlaku (expiration).
  return `/api/uploads/${encodeURIComponent(storageKey)}`;
}

/**
 * Membaca isi file foto langsung sebagai Buffer — dipakai server-side saat
 * merender PDF (react-pdf butuh Buffer/base64, bukan URL HTTP). Provider
 * S3/R2/Supabase juga mendukung pola serupa (GetObject -> Buffer).
 */
export async function getPhotoBuffer(storageKey: string): Promise<Buffer | null> {
  try {
    const filePath = resolveSafePath(storageKey);
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}

export async function uploadReport(
  storageKey: string,
  fileBuffer: Buffer
): Promise<void> {
  const filePath = resolveSafePath(storageKey);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, fileBuffer);
}

export async function getReportUrl(storageKey: string): Promise<string> {
  // TODO(production): kembalikan signed URL dengan masa berlaku (expiration).
  return `/api/uploads/${encodeURIComponent(storageKey)}`;
}
