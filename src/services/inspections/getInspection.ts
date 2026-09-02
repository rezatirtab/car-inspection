import { prisma } from "@/lib/db/prisma";

export async function getInspectionDetail(inspectionId: string) {
  return prisma.inspection.findUnique({
    where: { id: inspectionId },
    include: {
      client: true,
      vehicle: true,
      inspector: { select: { id: true, name: true, phone: true } },
      sectionSnapshots: {
        orderBy: { displayOrder: "asc" },
        include: {
          items: {
            orderBy: { displayOrder: "asc" },
            include: {
              result: {
                include: {
                  diagnostics: true,
                  photos: true,
                  findings: { include: { photos: true } },
                },
              },
            },
          },
        },
      },
      findings: { include: { photos: true } },
      finalAssessment: true,
    },
  });
}

/** Versi ringan untuk daftar inspeksi (dashboard/list). */
export async function listInspections(params: {
  inspectorId?: string;
  status?: "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "REVIEWED" | "CANCELLED";
  skip?: number;
  take?: number;
}) {
  return prisma.inspection.findMany({
    where: {
      inspectorId: params.inspectorId,
      status: params.status,
    },
    orderBy: { createdAt: "desc" },
    skip: params.skip,
    take: params.take ?? 50,
    include: {
      client: { select: { name: true } },
      vehicle: { select: { plateNumber: true, brand: true, model: true } },
      inspector: { select: { name: true } },
    },
  });
}
