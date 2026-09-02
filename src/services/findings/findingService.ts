import { prisma } from "@/lib/db/prisma";
import type { z } from "zod";
import type { createFindingSchema, updateFindingSchema } from "@/lib/validation/schemas";

export async function createFinding(
  inspectionId: string,
  input: z.infer<typeof createFindingSchema>
) {
  const finding = await prisma.finding.create({
    data: {
      inspectionId,
      resultId: input.resultId,
      severity: input.severity,
      priority: input.priority,
      title: input.title,
      description: input.description,
      recommendation: input.recommendation,
      estimatedCostMin: input.estimatedCostMin,
      estimatedCostMax: input.estimatedCostMax,
    },
  });

  if (input.resultId) {
    await prisma.inspectionResult.update({
      where: { id: input.resultId },
      data: { isFinding: true },
    });
  }

  return finding;
}

export async function updateFinding(
  findingId: string,
  input: z.infer<typeof updateFindingSchema>
) {
  return prisma.finding.update({
    where: { id: findingId },
    data: input,
  });
}

export async function deleteFinding(findingId: string) {
  return prisma.finding.delete({ where: { id: findingId } });
}
