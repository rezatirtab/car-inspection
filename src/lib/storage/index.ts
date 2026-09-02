/**
 * STORAGE ABSTRACTION
 * ------------------------------------------------------------------
 * Komponen lain di aplikasi TIDAK BOLEH memanggil Supabase secara
 * langsung — semua akses foto & PDF lewat modul ini.
 *
 * Implementasi saat ini: SUPABASE STORAGE. Upload/download tetap lewat
 * proxy /api/uploads/[...key] (bukan direct-to-storage presigned URL) —
 * ini pilihan sengaja supaya kontrak dengan frontend tidak berubah dan
 * requireAuth() di route itu tetap jadi satu-satunya pintu penjagaan akses.
 *
 * Environment variable yang dibutuhkan (lihat .env.example):
 * SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_BUCKET.
 */
import { randomUUID } from "crypto";
import { supabase, STORAGE_BUCKET } from "./supabaseClient";

export type PresignedUpload = {
  uploadUrl: string;
  storageKey: string;
  method: "PUT" | "POST";
};

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
  mimeType: string
): Promise<void> {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storageKey, fileBuffer, {
      contentType: mimeType || "application/octet-stream",
      upsert: true,
    });
  if (error) {
    throw new Error(`Gagal upload foto ke Supabase: ${error.message}`);
  }
}

export async function deletePhoto(storageKey: string): Promise<void> {
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([storageKey]);
  if (error) {
    throw new Error(`Gagal hapus foto di Supabase: ${error.message}`);
  }
}

export async function getPhotoUrl(storageKey: string): Promise<string> {
  return `/api/uploads/${encodeURIComponent(storageKey)}`;
}

export async function getPhotoBuffer(storageKey: string): Promise<Buffer | null> {
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(storageKey);
  if (error || !data) return null;
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function uploadReport(
  storageKey: string,
  fileBuffer: Buffer
): Promise<void> {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storageKey, fileBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });
  if (error) {
    throw new Error(`Gagal upload report ke Supabase: ${error.message}`);
  }
}

export async function getReportUrl(storageKey: string): Promise<string> {
  return `/api/uploads/${encodeURIComponent(storageKey)}`;
}