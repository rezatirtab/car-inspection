import { prisma } from "@/lib/db/prisma";
import { getPhotoBuffer } from "@/lib/storage";
import type { EvidencePhoto } from "@/types/report";

/**
 * Mengambil seluruh foto yang terlampir pada Important Finding suatu
 * inspeksi, lengkap dengan isi file (Buffer) untuk di-embed ke PDF —
 * bagian "Evidence Third" pada REPORT HIERARCHY di SOP.
 */
export async function buildEvidencePhotos(inspectionId: string): Promise<EvidencePhoto[]> {
  const findings = await prisma.finding.findMany({
    where: { inspectionId },
    include: {
      photos: true,
      result: {
        include: { itemSnapshot: { include: { sectionSnapshot: true } } },
      },
    },
  });

  const evidence: EvidencePhoto[] = [];

  for (const finding of findings) {
    for (const photo of finding.photos) {
      const buffer = await getPhotoBuffer(photo.storageKey);
      if (!buffer) continue; // foto tidak ditemukan di storage, lewati agar report tetap bisa dibuat
      evidence.push({
        section: finding.result?.itemSnapshot.sectionSnapshot.name ?? "-",
        item: finding.result?.itemSnapshot.name ?? finding.title,
        severity: finding.severity,
        caption: finding.description,
        buffer,
      });
    }
  }

  return evidence;
}
