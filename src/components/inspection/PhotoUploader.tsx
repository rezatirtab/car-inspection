"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "@/lib/utils/clsx";

export type PhotoData = {
  id: string;
  storageKey: string;
  fileName: string;
};

type Target = { resultId: string } | { findingId: string };

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

function photoUrl(storageKey: string) {
  return `/api/uploads/${encodeURIComponent(storageKey)}`;
}

/**
 * Upload foto langsung dari kamera/galeri HP. Alur: presign -> upload file
 * ke storage -> simpan metadata -> tampil sebagai thumbnail.
 * Dipakai baik untuk foto per-item checklist (target: resultId) maupun
 * foto Important Finding (target: findingId).
 */
export function PhotoUploader({
  inspectionId,
  target,
  photos,
  disabled,
}: {
  inspectionId: string;
  target: Target;
  photos: PhotoData[];
  disabled?: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // supaya bisa pilih file yang sama lagi kalau perlu
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Ukuran foto maksimal 8MB.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      // 1. Minta URL upload (presign)
      const presignRes = await fetch(`/api/inspections/${inspectionId}/photos/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, mimeType: file.type }),
      });
      const presignJson = await presignRes.json();
      if (!presignJson.success) {
        throw new Error(presignJson.error?.message ?? "Gagal menyiapkan upload.");
      }
      const { uploadUrl, storageKey } = presignJson.data;

      // 2. Upload file ke storage
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) {
        throw new Error("Gagal mengunggah file.");
      }

      // 3. Simpan metadata
      const metaRes = await fetch(`/api/inspections/${inspectionId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...target,
          storageKey,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
        }),
      });
      const metaJson = await metaRes.json();
      if (!metaJson.success) {
        throw new Error(metaJson.error?.message ?? "Gagal menyimpan data foto.");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah foto.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(photoId: string) {
    setDeletingId(photoId);
    setError(null);
    try {
      const res = await fetch(`/api/photos/${photoId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Gagal menghapus foto.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus foto.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative h-20 w-20 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl(photo.storageKey)}
              alt={photo.fileName}
              className="h-20 w-20 rounded-lg border border-slate-200 object-cover"
            />
            {!disabled && (
              <button
                type="button"
                onClick={() => handleDelete(photo.id)}
                disabled={deletingId === photo.id}
                className={clsx(
                  "absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-sm transition-opacity",
                  deletingId === photo.id ? "opacity-50" : "opacity-90 hover:opacity-100"
                )}
                aria-label="Hapus foto"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {!disabled && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-600 disabled:opacity-50"
          >
            <span className="text-lg leading-none">{uploading ? "..." : "📷"}</span>
            <span className="text-[10px] font-medium">
              {uploading ? "Mengunggah" : "Tambah Foto"}
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelected}
      />

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
