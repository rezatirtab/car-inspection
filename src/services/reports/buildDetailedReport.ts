import { prisma } from "@/lib/db/prisma";

/**
 * Detailed Inspection Appendix — seluruh hasil checklist per section,
 * ditampilkan setelah Client Summary (lihat SOP bagian 21-23:
 * "Summary First, Detail Second, Evidence Third").
 */
export async function buildDetailedReport(inspectionId: string) {
  const sections = await prisma.sectionSnapshot.findMany({
    where: { inspectionId },
    orderBy: { displayOrder: "asc" },
    include: {
      items: {
        orderBy: { displayOrder: "asc" },
        include: {
          result: {
            include: { diagnostics: true, photos: true },
          },
        },
      },
    },
  });

  return sections.map((section) => ({
    code: section.code,
    name: section.name,
    items: section.items.map((item) => ({
      code: item.code,
      name: item.name,
      inputType: item.inputType,
      condition: item.result?.condition ?? null,
      notes: item.result?.notes ?? null,
      technicalValue: item.result?.technicalValue ?? null,
      technicalUnit: item.result?.technicalUnit ?? null,
      diagnostics: item.result?.diagnostics ?? [],
      photoCount: item.result?.photos.length ?? 0,
    })),
  }));
}
