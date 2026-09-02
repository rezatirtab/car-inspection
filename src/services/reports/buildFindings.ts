import { prisma } from "@/lib/db/prisma";

export async function buildFindings(inspectionId: string) {
  const findings = await prisma.finding.findMany({
    where: { inspectionId },
    include: {
      photos: true,
      result: {
        include: {
          itemSnapshot: { include: { sectionSnapshot: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return findings.map((f) => ({
    id: f.id,
    section: f.result?.itemSnapshot.sectionSnapshot.name ?? "-",
    item: f.result?.itemSnapshot.name ?? f.title,
    severity: f.severity,
    description: f.description,
    recommendation: f.recommendation,
    estimatedCostMin: f.estimatedCostMin ? Number(f.estimatedCostMin) : null,
    estimatedCostMax: f.estimatedCostMax ? Number(f.estimatedCostMax) : null,
    photoStorageKeys: f.photos.map((p) => p.storageKey),
  }));
}
