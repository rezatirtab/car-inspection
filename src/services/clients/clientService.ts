import { prisma } from "@/lib/db/prisma";
import type { z } from "zod";
import type { createClientSchema, updateClientSchema } from "@/lib/validation/schemas";

export async function listClients(search?: string) {
  return prisma.client.findMany({
    where: search
      ? { name: { contains: search, mode: "insensitive" } }
      : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function getClient(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: { inspections: { orderBy: { createdAt: "desc" }, take: 20 } },
  });
}

export async function createClient(input: z.infer<typeof createClientSchema>) {
  return prisma.client.create({ data: input });
}

export async function updateClient(
  id: string,
  input: z.infer<typeof updateClientSchema>
) {
  return prisma.client.update({ where: { id }, data: input });
}
