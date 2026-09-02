/**
 * Konstanta domain aplikasi.
 * Semua label yang tampil ke Inspector/Admin/Client menggunakan Bahasa Indonesia,
 * sedangkan value enum tetap mengikuti Prisma schema (Bahasa Inggris) agar
 * konsisten dengan database & API contract.
 */

export const CONDITION_LABEL: Record<string, string> = {
  GOOD: "Baik",
  ATTENTION: "Perhatian",
  PROBLEM: "Bermasalah",
  NA: "Tidak Berlaku",
};

export const CONDITION_COLOR: Record<string, string> = {
  GOOD: "#16A34A", // hijau
  ATTENTION: "#D97706", // kuning/oranye
  PROBLEM: "#DC2626", // merah
  NA: "#6B7280", // abu-abu
};

export const CONDITION_ICON: Record<string, string> = {
  GOOD: "🟢",
  ATTENTION: "🟡",
  PROBLEM: "🔴",
  NA: "⚪",
};

export const INSPECTION_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  IN_PROGRESS: "Sedang Berjalan",
  COMPLETED: "Selesai",
  REVIEWED: "Sudah Direview",
  CANCELLED: "Dibatalkan",
};

export const USER_ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  INSPECTOR: "Inspector",
};

export const SEVERITY_LABEL: Record<string, string> = {
  ATTENTION: "Perhatian",
  PROBLEM: "Bermasalah",
};

export const PRIORITY_LABEL: Record<string, string> = {
  LOW: "Rendah",
  MEDIUM: "Sedang",
  HIGH: "Tinggi",
  CRITICAL: "Kritis",
};

export const REPORT_TYPE_LABEL: Record<string, string> = {
  CLIENT_SUMMARY: "Ringkasan untuk Client",
  DETAILED_REPORT: "Laporan Detail",
  FULL_REPORT: "Laporan Lengkap",
};

// Draft — belum final, lihat catatan validasi di README.
export const ACCIDENT_ASSESSMENT_OPTIONS = [
  { value: "NO_INDICATION", label: "Tidak ditemukan indikasi laka berat" },
  { value: "POSSIBLE_INDICATION", label: "Terdapat kondisi yang perlu diperiksa lebih lanjut" },
  { value: "INDICATION", label: "Terdapat indikasi laka" },
  { value: "MAJOR_INDICATION", label: "Indikasi laka berat" },
  { value: "INCONCLUSIVE", label: "Tidak dapat disimpulkan" },
] as const;

export const FLOOD_ASSESSMENT_OPTIONS = [
  { value: "NO_INDICATION", label: "Tidak ditemukan indikasi" },
  { value: "POSSIBLE_INDICATION", label: "Terdapat kondisi yang perlu diperiksa lebih lanjut" },
  { value: "INDICATION", label: "Terdapat indikasi" },
  { value: "INCONCLUSIVE", label: "Tidak dapat disimpulkan" },
] as const;

export const OVERALL_CONDITION_OPTIONS = [
  { value: "GOOD", label: "Excellent" },
  { value: "ATTENTION", label: "Fair / Perlu Perhatian" },
  { value: "PROBLEM", label: "Poor" },
] as const;

export const FINAL_RECOMMENDATION_OPTIONS = [
  { value: "RECOMMENDED", label: "Recommended" },
  { value: "RECOMMENDED_WITH_ATTENTION", label: "Recommended with Attention" },
  { value: "FURTHER_INSPECTION_RECOMMENDED", label: "Further Inspection Recommended" },
  { value: "NOT_RECOMMENDED", label: "Not Recommended" },
] as const;

export const AVAILABILITY_OPTIONS = [
  { value: "AVAILABLE", label: "Tersedia" },
  { value: "NOT_AVAILABLE", label: "Tidak Tersedia" },
  { value: "NOT_SHOWN", label: "Tidak Ditunjukkan" },
  { value: "NOT_EQUIPPED", label: "Tidak Dilengkapi Pabrik" },
] as const;

/**
 * Draft scoring — BELUM FINAL. Lihat README bagian "Keputusan & Asumsi".
 * Formula ini hanya untuk membuat aplikasi dapat berjalan end-to-end;
 * harus divalidasi ulang dengan SOP resmi perusahaan sebelum dipakai
 * sebagai hasil resmi ke client.
 */
export const DRAFT_CONDITION_SCORE: Record<string, number> = {
  GOOD: 100,
  ATTENTION: 60,
  PROBLEM: 20,
  NA: -1, // dikecualikan dari perhitungan, bukan dihitung 0
};
