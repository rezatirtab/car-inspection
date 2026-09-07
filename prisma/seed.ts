/**
 * SEED — MASTER SOP CHECKLIST (8 Section)
 * Mengikuti dokumen "MASTER SOP INSPECTION CHECKLIST V1.0" & blueprint.
 *
 * Jalankan: npm run db:seed
 */
import { PrismaClient, InputType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type SeedItem = {
  code: string;
  name: string;
  inputType: InputType;
  allowsNotes?: boolean;
  allowsPhoto?: boolean;
  allowsFinding?: boolean;
  isRequired?: boolean;
};

type SeedSection = {
  code: string;
  name: string;
  description: string;
  items: SeedItem[];
};

const SECTIONS: SeedSection[] = [
  {
    code: "EXT",
    name: "Exterior",
    description: "Kondisi body, panel, dan komponen eksterior kendaraan.",
    items: [
      { code: "EXT-BPD", name: "Bumper Depan", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "EXT-BPB", name: "Bumper Belakang", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "EXT-BSK", name: "Bumper Samping Kiri", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "EXT-BSKN", name: "Bumper Samping Kanan", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "EXT-KAP", name: "Kap Mesin", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "EXT-FDK", name: "Fender Depan Kanan", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "EXT-FDKR", name: "Fender Depan Kiri", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "EXT-FBK", name: "Fender Belakang Kanan", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "EXT-FBKR", name: "Fender Belakang Kiri", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "EXT-PDK", name: "Pintu Depan Kanan", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "EXT-PBK", name: "Pintu Belakang Kanan", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "EXT-PDKR", name: "Pintu Depan Kiri", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "EXT-PBKR", name: "Pintu Belakang Kiri", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "EXT-PBG", name: "Pintu Bagasi", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "EXT-ROOF", name: "Roof", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "EXT-SPL", name: "Spoiler", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true, isRequired: false },
      { code: "EXT-HLP", name: "Fisik Headlamp", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "EXT-FGL", name: "Fisik Foglamp", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true, isRequired: false },
      { code: "EXT-STL", name: "Fisik Stoplamp", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "EXT-SPN", name: "Spion Kanan/Kiri", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "EXT-KCM", name: "Kaca Mobil", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
    ],
  },
  {
    code: "INT",
    name: "Interior",
    description: "Kondisi kabin, kelistrikan interior, dan kenyamanan.",
    items: [
      { code: "INT-DSH", name: "Dashboard", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "INT-HU", name: "Head Unit", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "INT-STR", name: "Steering / Setir", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "INT-DTM", name: "Door Trim", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "INT-CL", name: "Central Lock", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "INT-PW", name: "Power Window", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "INT-MRR", name: "Electric/Retract Mirror", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "INT-PLF", name: "Plafon", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "INT-SRF", name: "Sunroof/Moonroof", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true, isRequired: false },
      { code: "INT-JOK", name: "Jok", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "INT-KRP", name: "Karpet Dasar", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "INT-PDL", name: "Pedal", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "INT-TPR", name: "Tuas Persneling", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "INT-PKT", name: "Panel Konsol Tengah", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "INT-PGB", name: "Panel Area Glove Box", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "INT-AC", name: "Climate AC", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "INT-SVR", name: "Sunvisor", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "INT-PBR", name: "Parking Brake", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "INT-KAC", name: "Kisi-kisi AC", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
    ],
  },
  {
    code: "CHS",
    name: "Rangka & Sasis",
    description: "Struktur rangka kendaraan — dasar assessment kecelakaan.",
    items: [
      { code: "CHS-BHA", name: "Bulkhead Atas", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "CHS-BHT", name: "Bulkhead Tengah", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "CHS-BHB", name: "Bulkhead Bawah", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "CHS-STK", name: "Strut Tower Kanan", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "CHS-STKR", name: "Strut Tower Kiri", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "CHS-UPK", name: "Upron Kanan", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "CHS-UPKR", name: "Upron Kiri", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "CHS-PLA", name: "Pilar A", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "CHS-PLB", name: "Pilar B", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "CHS-PLC", name: "Pilar C", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
    ],
  },
  {
    code: "ENG",
    name: "Mesin & Transmisi",
    description: "Kondisi mesin, transmisi, dan sistem pendukungnya.",
    items: [
      { code: "ENG-KM", name: "Kondisi Mesin", inputType: "CONDITION_TEXT", allowsPhoto: true, allowsFinding: true },
      { code: "ENG-IDL", name: "Idle", inputType: "CONDITION_TEXT", allowsPhoto: true, allowsFinding: true },
      { code: "ENG-THR", name: "Throttle", inputType: "CONDITION_TEXT", allowsPhoto: true, allowsFinding: true },
      { code: "ENG-OLI", name: "Oli Mesin", inputType: "CONDITION_TEXT", allowsPhoto: true, allowsFinding: true },
      { code: "ENG-STR", name: "Starter", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "ENG-AKI", name: "Aki", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "ENG-ALT", name: "Alternator", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "ENG-RAD", name: "Radiator", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "ENG-TRN", name: "Transmisi", inputType: "CONDITION_TEXT", allowsPhoto: true, allowsFinding: true },
      { code: "ENG-KPL", name: "Kopling", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "ENG-REM", name: "Rem (Supporting System)", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "ENG-ACS", name: "A/C (Supporting System)", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "ENG-DTC", name: "Diagnostic Scan / DTC", inputType: "DIAGNOSTIC", allowsPhoto: false, allowsFinding: true, isRequired: false },
    ],
  },
  {
    code: "SUS",
    name: "Kaki-kaki",
    description: "Sistem kemudi, suspensi, dan pengereman.",
    items: [
      { code: "SUS-RCK", name: "Rack Steer", inputType: "CONDITION_PERCENTAGE", allowsPhoto: true, allowsFinding: true },
      { code: "SUS-PWS", name: "Power Steering", inputType: "CONDITION_PERCENTAGE", allowsPhoto: true, allowsFinding: true },
      { code: "SUS-LTR", name: "Long Tie Rod", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "SUS-BJT", name: "Ball Joint", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "SUS-DFT", name: "Drive Shaft", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "SUS-KRM", name: "Kampas Rem", inputType: "CONDITION_PERCENTAGE", allowsPhoto: true, allowsFinding: true },
      { code: "SUS-SUS", name: "Suspensi", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "SUS-VLG", name: "Velg", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
    ],
  },
  {
    code: "TIR",
    name: "Ban",
    description: "Kondisi keempat ban dan ban cadangan.",
    items: [
      { code: "TIR-DKI", name: "Ban Depan Kiri", inputType: "CONDITION_PERCENTAGE", allowsPhoto: true, allowsFinding: true },
      { code: "TIR-DKA", name: "Ban Depan Kanan", inputType: "CONDITION_PERCENTAGE", allowsPhoto: true, allowsFinding: true },
      { code: "TIR-BKI", name: "Ban Belakang Kiri", inputType: "CONDITION_PERCENTAGE", allowsPhoto: true, allowsFinding: true },
      { code: "TIR-BKA", name: "Ban Belakang Kanan", inputType: "CONDITION_PERCENTAGE", allowsPhoto: true, allowsFinding: true },
      { code: "TIR-CAD", name: "Ban Cadangan", inputType: "AVAILABILITY", allowsPhoto: false, allowsFinding: false, isRequired: false },
    ],
  },
  {
    code: "LGT",
    name: "Lampu-lampu",
    description: "Fungsi seluruh sistem penerangan kendaraan.",
    items: [
      { code: "LGT-HB", name: "High Beam", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "LGT-LB", name: "Low Beam", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "LGT-SNJ", name: "Lampu Senja", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "LGT-FOG", name: "Foglamp", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true, isRequired: false },
      { code: "LGT-STP", name: "Stop Lamp", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "LGT-TL", name: "Tail Light", inputType: "CONDITION", allowsPhoto: true, allowsFinding: true },
      { code: "LGT-KAB", name: "Lampu Kabin", inputType: "CONDITION", allowsPhoto: false, allowsFinding: false },
    ],
  },
  {
    code: "DOC",
    name: "Dokumen & Kelengkapan",
    description: "Kelengkapan dokumen dan aksesoris kendaraan (status availability).",
    items: [
      { code: "DOC-STNK", name: "STNK", inputType: "AVAILABILITY", allowsPhoto: false, allowsFinding: false },
      { code: "DOC-BPKB", name: "BPKB", inputType: "AVAILABILITY", allowsPhoto: false, allowsFinding: false },
      { code: "DOC-FKT", name: "Faktur", inputType: "AVAILABILITY", allowsPhoto: false, allowsFinding: false, isRequired: false },
      { code: "DOC-SPH", name: "SPH", inputType: "AVAILABILITY", allowsPhoto: false, allowsFinding: false, isRequired: false },
      { code: "DOC-BSV", name: "Buku Service", inputType: "AVAILABILITY", allowsPhoto: false, allowsFinding: false, isRequired: false },
      { code: "DOC-BMN", name: "Buku Manual", inputType: "AVAILABILITY", allowsPhoto: false, allowsFinding: false, isRequired: false },
      { code: "DOC-KCD", name: "Kunci Cadangan", inputType: "AVAILABILITY", allowsPhoto: false, allowsFinding: false },
      { code: "DOC-SGT", name: "Segitiga Pengaman", inputType: "AVAILABILITY", allowsPhoto: false, allowsFinding: false },
      { code: "DOC-KRD", name: "Kunci Roda", inputType: "AVAILABILITY", allowsPhoto: false, allowsFinding: false },
      { code: "DOC-DGK", name: "Dongkrak", inputType: "AVAILABILITY", allowsPhoto: false, allowsFinding: false },
      { code: "DOC-BCD", name: "Ban Cadangan (Dokumen)", inputType: "AVAILABILITY", allowsPhoto: false, allowsFinding: false, isRequired: false },
    ],
  },
];

async function main() {
  console.log("Seeding master SOP...");

  for (let sIdx = 0; sIdx < SECTIONS.length; sIdx++) {
    const section = SECTIONS[sIdx];
    const createdSection = await prisma.inspectionSection.upsert({
      where: { code: section.code },
      update: {
        name: section.name,
        description: section.description,
        displayOrder: sIdx + 1,
      },
      create: {
        code: section.code,
        name: section.name,
        description: section.description,
        displayOrder: sIdx + 1,
      },
    });

    for (let iIdx = 0; iIdx < section.items.length; iIdx++) {
      const item = section.items[iIdx];
      await prisma.item.upsert({
        where: { sectionId_code: { sectionId: createdSection.id, code: item.code } },
        update: {
          name: item.name,
          inputType: item.inputType,
          isRequired: item.isRequired ?? true,
          allowsNotes: item.allowsNotes ?? true,
          allowsPhoto: item.allowsPhoto ?? false,
          allowsFinding: item.allowsFinding ?? false,
          displayOrder: iIdx + 1,
        },
        create: {
          sectionId: createdSection.id,
          code: item.code,
          name: item.name,
          inputType: item.inputType,
          isRequired: item.isRequired ?? true,
          allowsNotes: item.allowsNotes ?? true,
          allowsPhoto: item.allowsPhoto ?? false,
          allowsFinding: item.allowsFinding ?? false,
          displayOrder: iIdx + 1,
        },
      });
    }

    console.log(`  - ${section.name}: ${section.items.length} item`);
  }

  // Akun awal supaya aplikasi tidak kosong saat pertama dijalankan.
  const adminPasswordHash = await bcrypt.hash("Admin12345!", 10);
  const inspectorPasswordHash = await bcrypt.hash("Inspector12345!", 10);

  await prisma.user.upsert({
    where: { email: "admin@inspeksi.local" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@inspeksi.local",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "inspector@inspeksi.local" },
    update: { name: "Rizal" },
    create: {
      name: "Rizal",
      email: "inspector@inspeksi.local",
      passwordHash: inspectorPasswordHash,
      role: "INSPECTOR",
    },
  });

  console.log("Seed selesai.");
  console.log("Login admin     : admin@inspeksi.local / Admin12345!");
  console.log("Login inspector : inspector@inspeksi.local / Inspector12345!");
  console.log("PENTING: ganti password ini sebelum digunakan di produksi.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
