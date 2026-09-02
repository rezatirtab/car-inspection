import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db/prisma";

/**
 * Membuat nomor inspeksi human-readable: INS-<tahun>-<urutan 6 digit>.
 * Berbeda dari id (UUID) internal — ini yang ditampilkan ke client.
 */
async function generateInspectionNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INS-${year}-`;

  const last = await prisma.inspection.findFirst({
    where: { inspectionNumber: { startsWith: prefix } },
    orderBy: { inspectionNumber: "desc" },
    select: { inspectionNumber: true },
  });

  let nextSeq = 1;
  if (last) {
    const lastSeq = parseInt(last.inspectionNumber.slice(prefix.length), 10);
    if (!Number.isNaN(lastSeq)) nextSeq = lastSeq + 1;
  }

  return `${prefix}${String(nextSeq).padStart(6, "0")}`;
}

export async function createInspection(params: {
  clientId: string;
  vehicleId: string;
  inspectorId: string;
  inspectionLocation?: string;
}) {
  const inspectionNumber = await generateInspectionNumber();

  // Ambil SOP master aktif, urut sesuai display_order.
  const sections = await prisma.inspectionSection.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    include: {
      items: { where: { isActive: true }, orderBy: { displayOrder: "asc" } },
    },
  });

  if (sections.length === 0) {
    throw new Error(
      "Master SOP kosong. Jalankan `npm run db:seed` terlebih dahulu sebelum membuat inspeksi."
    );
  }

  return prisma.$transaction(async (tx) => {
    const inspection = await tx.inspection.create({
      data: {
        inspectionNumber,
        clientId: params.clientId,
        vehicleId: params.vehicleId,
        inspectorId: params.inspectorId,
        inspectionLocation: params.inspectionLocation,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    });

    // Snapshot SOP: Section -> Item, agar report tidak berubah walau
    // master SOP diedit di kemudian hari.
    // ID di-generate di sini (bukan menunggu DB) supaya section & item bisa
    // di-insert lewat createMany (batch) alih-alih satu-satu — jauh lebih
    // sedikit round-trip ke database dan tidak kena timeout transaction.
    const sectionSnapshotData = sections.map((section) => ({
      id: randomUUID(),
      inspectionId: inspection.id,
      sectionId: section.id,
      code: section.code,
      name: section.name,
      displayOrder: section.displayOrder,
    }));

    const itemSnapshotData = sections.flatMap((section, idx) =>
      section.items.map((item) => ({
        id: randomUUID(),
        inspectionId: inspection.id,
        sectionSnapshotId: sectionSnapshotData[idx].id,
        itemId: item.id,
        code: item.code,
        name: item.name,
        description: item.description,
        inputType: item.inputType,
        displayOrder: item.displayOrder,
        allowsNotes: item.allowsNotes,
        allowsPhoto: item.allowsPhoto,
        allowsFinding: item.allowsFinding,
      }))
    );

    if (sectionSnapshotData.length > 0) {
      await tx.sectionSnapshot.createMany({ data: sectionSnapshotData });
    }
    if (itemSnapshotData.length > 0) {
      await tx.itemSnapshot.createMany({ data: itemSnapshotData });
    }

    return tx.inspection.findUniqueOrThrow({
      where: { id: inspection.id },
      include: { client: true, vehicle: true, inspector: true },
    });
  }, {
    // Jaring pengaman tambahan: koneksi ke Prisma Postgres lewat serverless
    // function punya latency lebih tinggi dari dev lokal.
    maxWait: 10000,
    timeout: 20000,
  });
}