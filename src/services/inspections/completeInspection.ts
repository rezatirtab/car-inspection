import { prisma } from "@/lib/db/prisma";

export class InspectionIncompleteError extends Error {
  missing: string[];
  constructor(missing: string[]) {
    super("Inspeksi belum lengkap.");
    this.missing = missing;
  }
}

/**
 * Memvalidasi bahwa seluruh item wajib (isRequired via master item, kita
 * simpan flag ini di level snapshot lewat item master saat snapshot dibuat)
 * sudah memiliki hasil, lalu mengubah status menjadi COMPLETED.
 *
 * Catatan: karena isRequired tidak disalin ke ItemSnapshot pada schema V1
 * (lihat prisma/schema.prisma), validasi "wajib diisi" di sini memakai
 * aturan sederhana: SEMUA item snapshot harus memiliki result. Jika bisnis
 * membutuhkan sebagian item benar-benar opsional, tambahkan kolom
 * isRequired pada ItemSnapshot dan sesuaikan query ini.
 */
export async function completeInspection(inspectionId: string) {
  const itemSnapshots = await prisma.itemSnapshot.findMany({
    where: { inspectionId },
    include: {
      result: true,
      sectionSnapshot: { select: { name: true } },
    },
  });

  const missing = itemSnapshots
    .filter((item) => !item.result)
    .map((item) => `${item.sectionSnapshot.name} / ${item.name}`);

  if (missing.length > 0) {
    throw new InspectionIncompleteError(missing);
  }

  // RED tanpa finding tetap boleh (finding bersifat manual/opsional per
  // Rule 6), tapi kita tetap validasi bahwa Final Assessment sudah diisi.
  const finalAssessment = await prisma.finalAssessment.findUnique({
    where: { inspectionId },
  });

  if (!finalAssessment) {
    throw new InspectionIncompleteError(["Final Assessment belum diisi."]);
  }

  return prisma.inspection.update({
    where: { id: inspectionId },
    data: { status: "COMPLETED", completedAt: new Date() },
  });
}
