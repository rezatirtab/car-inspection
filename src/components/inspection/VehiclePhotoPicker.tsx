"use client";

import { useRef, useState } from "react";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

/**
 * Berbeda dari PhotoUploader — komponen ini TIDAK langsung upload saat
 * dipilih, karena dipakai di form "Inspeksi Baru" SEBELUM inspeksi (dan
 * karenanya inspectionId) benar-benar dibuat. File dipegang di memori
 * (lewat onFileSelected), baru benar-benar diupload oleh parent setelah
 * inspeksi berhasil dibuat.
 */
export function VehiclePhotoPicker({
  onFileSelected,
}: {
  onFileSelected: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Ukuran foto maksimal 8MB.");
      return;
    }

    setError(null);
    setPreviewUrl(URL.createObjectURL(file));
    onFileSelected(file);
  }

  function handleRemove() {
    setPreviewUrl(null);
    onFileSelected(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      {previewUrl ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Preview foto kendaraan"
            className="h-32 w-48 rounded-lg border border-slate-200 object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-sm"
            aria-label="Hapus foto"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-32 w-48 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-600"
        >
          <span className="text-2xl leading-none">📷</span>
          <span className="text-xs font-medium">Tambah Foto Kendaraan</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      <p className="mt-1 text-xs text-slate-400">Opsional — akan tampil di laporan PDF.</p>
    </div>
  );
}
