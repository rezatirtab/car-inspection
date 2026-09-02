import { prisma } from "@/lib/db/prisma";

export class InspectionNotReviewableError extends Error {
  constructor(currentStatus: string) {
    super(
      `Inspeksi berstatus "${currentStatus}" tidak dapat direview. Hanya inspeksi berstatus COMPLETED yang bisa direview.`
    );
  }
}

/**
 * Menandai inspeksi sebagai sudah direview Admin. Catatan: skema saat ini
 * belum menyimpan identitas reviewer/catatan review secara terpisah (lihat
 * README bagian Keputusan & Asumsi) — hanya transisi status
 * COMPLETED -> REVIEWED. Kalau nanti butuh jejak audit yang lebih detail
 * (siapa yang review, kapan, catatan apa), tambahkan kolom baru di model
 * Inspection atau tabel terpisah.
 */
export async function reviewInspection(inspectionId: string) {
  const inspection = await prisma.inspection.findUniqueOrThrow({
    where: { id: inspectionId },
    select: { status: true },
  });

  if (inspection.status !== "COMPLETED") {
    throw new InspectionNotReviewableError(inspection.status);
  }

  return prisma.inspection.update({
    where: { id: inspectionId },
    data: { status: "REVIEWED" },
  });
}
