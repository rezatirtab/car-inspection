import { prisma } from "@/lib/db/prisma";
import type { z } from "zod";
import type { createVehicleSchema, updateVehicleSchema } from "@/lib/validation/schemas";

export async function listVehicles(search?: string) {
  return prisma.vehicle.findMany({
    where: search
      ? {
          OR: [
            { plateNumber: { contains: search, mode: "insensitive" } },
            { brand: { contains: search, mode: "insensitive" } },
            { model: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function getVehicle(id: string) {
  return prisma.vehicle.findUnique({
    where: { id },
    include: { inspections: { orderBy: { createdAt: "desc" }, take: 20 } },
  });
}

export async function createVehicle(input: z.infer<typeof createVehicleSchema>) {
  return prisma.vehicle.create({ data: input });
}

export async function updateVehicle(
  id: string,
  input: z.infer<typeof updateVehicleSchema>
) {
  return prisma.vehicle.update({ where: { id }, data: input });
}
