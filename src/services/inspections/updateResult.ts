import { prisma } from "@/lib/db/prisma";
import type { z } from "zod";
import type { updateInspectionResultSchema } from "@/lib/validation/schemas";

type Input = z.infer<typeof updateInspectionResultSchema>;

/**
 * Menyimpan hasil satu item inspeksi (dipanggil sangat sering — autosave).
 * itemSnapshotId, bukan itemId master, karena inspector bekerja terhadap
 * snapshot SOP milik inspeksi ini.
 */
export async function updateInspectionResult(
  inspectionId: string,
  itemSnapshotId: string,
  input: Input
) {
  const itemSnapshot = await prisma.itemSnapshot.findUnique({
    where: { id: itemSnapshotId },
  });

  if (!itemSnapshot || itemSnapshot.inspectionId !== inspectionId) {
    throw new Error("ITEM_NOT_FOUND");
  }

  // RED wajib notes (sesuai aturan dokumentasi Blueprint bagian 1).
  if (input.condition === "PROBLEM" && !input.notes?.trim()) {
    throw new Error("NOTES_REQUIRED_FOR_PROBLEM");
  }

  const result = await prisma.inspectionResult.upsert({
    where: { itemSnapshotId },
    update: {
      condition: input.condition,
      notes: input.notes,
      technicalValue: input.technicalValue,
      technicalUnit: input.technicalUnit,
      completedAt: new Date(),
    },
    create: {
      inspectionId,
      itemSnapshotId,
      condition: input.condition,
      notes: input.notes,
      technicalValue: input.technicalValue,
      technicalUnit: input.technicalUnit,
      completedAt: new Date(),
    },
  });

  if (input.diagnostics && input.diagnostics.length > 0) {
    await prisma.diagnostic.deleteMany({ where: { resultId: result.id } });
    await prisma.diagnostic.createMany({
      data: input.diagnostics.map((d) => ({
        resultId: result.id,
        code: d.code,
        description: d.description,
        notes: d.notes,
      })),
    });
  }

  return result;
}
