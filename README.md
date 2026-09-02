# Vehicle Inspection Management System

Sistem manajemen inspeksi kendaraan bekas untuk Inspector (mobile-first) dan
Admin (dashboard web), dibangun dari dokumen desain teknis:
`file0_master_inspection_system`, `file1_inspection_SOP`, `file2_database`,
`file3_API`, `file4_project_foundation`.

Status proyek ini: **Foundation V1** — struktur, database, API, dan UI dasar
sudah lengkap dan dapat dijalankan end-to-end (login → buat inspeksi → isi
checklist → final assessment → complete → generate report). Beberapa bagian
sengaja dibuat sebagai *stub* yang perlu kamu lengkapi sebelum produksi
(lihat bagian "Yang Masih Perlu Dikerjakan").

---

## 1. Stack Teknologi

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript, Turbopack) |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL + Prisma ORM v6 |
| Validasi | Zod |
| Auth | Session cookie (httpOnly) + JWT ditandatangani dengan `jose` |
| Password | bcryptjs |

> **Catatan perubahan dari dokumen asli:** dokumen `file4_project_foundation`
> menyebut "Auth.js". Saya menggantinya dengan implementasi session custom
> yang lebih sederhana (`src/lib/auth/`) agar tidak bergantung pada
> konfigurasi Auth.js v5 yang saat ini masih beta dan sering berubah. Kalau
> kamu tetap ingin Auth.js, struktur `lib/auth/` sudah terisolasi sehingga
> mudah diganti tanpa menyentuh route/service lain.

---

## 2. Persiapan

### 2.1 Install dependency

```bash
npm install
```

### 2.2 Siapkan PostgreSQL

Pastikan PostgreSQL sudah jalan di komputer kamu (lokal, Docker, atau
layanan cloud seperti Supabase/Neon/Railway).

Contoh cepat pakai Docker:

```bash
docker run --name car-inspection-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=car_inspection -p 5432:5432 -d postgres:16
```

### 2.3 Environment variables

```bash
cp .env.example .env
```

Edit `.env`:
- `DATABASE_URL` — sesuaikan dengan kredensial PostgreSQL kamu.
- `AUTH_SECRET` — isi string acak minimal 32 karakter. Generate dengan:
  ```bash
  openssl rand -base64 32
  ```

### 2.4 Migrasi & seed database

```bash
npm run db:generate   # generate Prisma Client
npm run db:migrate    # buat tabel di database (akan minta nama migration, isi bebas mis. "init")
npm run db:seed       # isi Master SOP (8 section, seluruh item) + akun awal
```

Setelah seed selesai, akan muncul kredensial login di terminal:
```
Login admin     : admin@inspeksi.local / Admin12345!
Login inspector : inspector@inspeksi.local / Inspector12345!
```
**Ganti password ini sebelum dipakai produksi.**

### 2.5 Jalankan aplikasi

```bash
npm run dev
```

Buka http://localhost:3000 — akan redirect otomatis ke halaman login.

---

## 3. Alur Pemakaian (sesuai Inspection Workflow)

1. Login sebagai **Inspector** → dashboard menampilkan tombol "+ Inspeksi Baru".
2. Isi data client & kendaraan → sistem otomatis membuat **snapshot Master SOP**
   untuk inspeksi ini (agar report tidak berubah walau SOP master diedit
   di kemudian hari).
3. Isi checklist per section (Exterior, Interior, Rangka & Sasis, Mesin &
   Transmisi, Kaki-kaki, Ban, Lampu-lampu, Dokumen & Kelengkapan).
   - 🟢 Baik → langsung tersimpan, tanpa form tambahan.
   - 🟡 Perhatian → notes opsional.
   - 🔴 Bermasalah → **notes wajib diisi** (divalidasi di server), bisa
     langsung membuat "Important Finding".
   - ⚪ N/A → langsung tersimpan, dikecualikan dari perhitungan skor.
   - Untuk kondisi 🟡/🔴, muncul slot **foto** (kamera/galeri) di bawah item;
     setiap Important Finding juga punya slot fotonya sendiri.
4. Isi **Final Assessment** (Overall Condition, Accident Assessment, Flood
   Assessment, Final Recommendation, Conclusion).
5. Klik **Selesaikan Inspeksi** — sistem memvalidasi seluruh item sudah
   terisi dan Final Assessment sudah ada, lalu status berubah ke `COMPLETED`.
6. Generate report (Client Summary / Detailed Report / Full Report).
7. Login sebagai **Admin** untuk melihat seluruh inspeksi lintas inspector,
   dashboard ringkasan, dan (nantinya) mengelola Master SOP.

---

## 4. Struktur Folder

```
src/
  app/
    (auth)/login/            # halaman login
    (dashboard)/             # halaman ber-auth: dashboard, inspections, clients, vehicles, sop, reports
    api/                     # seluruh REST API (lihat file3_APi.docx untuk kontrak lengkap)
  components/
    ui/                      # Button, Card, Badge, Form primitives
    inspection/               # ConditionSelector, InspectionItem, FindingForm, FinalAssessment, dst.
    dashboard/                # StatCard, InspectionTable, DashboardNav
  lib/
    auth/                    # session.ts (JWT), guards.ts (requireAuth/requireRole/requireInspectionAccess)
    db/                      # Prisma client singleton
    validation/               # Zod schemas
    storage/                 # abstraksi upload foto & report (default: filesystem lokal)
    pdf/                     # abstraksi PDF generator (belum diimplementasikan — lihat bawah)
  services/
    inspections/ clients/ vehicles/ findings/ reports/   # business logic, terpisah dari route handler
  types/                     # tipe TypeScript (ReportData, dll)
  config/constants.ts        # label Indonesia, opsi dropdown, formula scoring draft
prisma/
  schema.prisma               # 14 tabel
  seed.ts                     # 8 section SOP + akun awal
```

---

## 5. Keputusan & Asumsi (WAJIB dibaca sebelum ke produksi)

Dokumen sumber menandai beberapa hal sebagai draft/TBD. Untuk membuat sistem
berjalan end-to-end, saya mengambil keputusan default berikut — **sesuai
arahanmu untuk memakai contoh default di dokumen**. Semua ini mudah diubah,
lokasinya sudah ditandai:

1. **Formula scoring** (`src/services/inspections/getSummary.ts` &
   `src/config/constants.ts` → `DRAFT_CONDITION_SCORE`) — GOOD=100,
   ATTENTION=60, PROBLEM=20, semua item dibobot sama rata, N/A dikecualikan
   dari perhitungan (bukan dihitung 0). Dokumen SOP eksplisit menyebut
   scoring system ini masih **draft** dan harus divalidasi ke SOP resmi
   perusahaan.
2. **Opsi Accident Assessment / Flood Assessment / Final Recommendation**
   (`src/config/constants.ts`) — memakai daftar contoh dari dokumen. Ini
   disimpan sebagai string bebas di database (bukan enum Prisma), supaya
   mudah diubah tanpa migration database ulang.
3. **Item wajib diisi (`isRequired`)** — ada di tabel master `Item`, tapi
   *belum* disalin ke `ItemSnapshot` (lihat `prisma/schema.prisma`). Saat
   ini validasi "Selesaikan Inspeksi" mewajibkan **semua** item snapshot
   terisi. Kalau kamu butuh sebagian item benar-benar opsional per
   inspeksi, tambahkan kolom `isRequired` ke `ItemSnapshot` dan sesuaikan
   `src/services/inspections/completeInspection.ts`.
4. **Wajib foto untuk Finding** — saat ini foto bersifat opsional secara
   teknis (field `allowsPhoto`, bukan `requiresPhoto`). Dokumen menyebut
   ini juga masih perlu dikonfirmasi ke SOP perusahaan.

---

## 6. Yang Masih Perlu Dikerjakan

PDF generator (6.1), upload foto dari UI (6.4), UI edit Master SOP (6.3),
dan Halaman Review Admin (6.5) — semuanya sudah selesai diimplementasikan.
Storage sudah berfungsi penuh untuk mode development (local filesystem) —
bagian yang masih perlu kamu lengkapi hanyalah penggantian ke provider
cloud saat produksi:

### 6.1 PDF Generator — ✅ SUDAH DIIMPLEMENTASIKAN

`src/lib/pdf/` memakai **`@react-pdf/renderer`** (render PDF di server,
berbasis komponen React — selaras dengan stack Next.js proyek ini, tanpa
perlu browser headless seperti Puppeteer).

Struktur halaman mengikuti REPORT HIERARCHY di SOP — **Summary First,
Detail Second, Evidence Third**:

| Report Type | Isi PDF |
|---|---|
| `CLIENT_SUMMARY` | Halaman ringkasan saja: data inspeksi, skor, condition summary, final assessment, important findings |
| `DETAILED_REPORT` | Ringkasan + halaman **Detailed Inspection Checklist** (seluruh item per section) |
| `FULL_REPORT` | Ringkasan + Detailed Checklist + halaman **Evidence Appendix** (foto setiap important finding) |

File terkait:
- `src/lib/pdf/theme.ts` — warna & style (selaras `src/config/constants.ts`)
- `src/lib/pdf/components/` — `ReportHeader`, `ClientSummaryContent`,
  `DetailedChecklistContent`, `EvidenceAppendixContent`,
  `InspectionReportDocument` (perakit halaman sesuai tipe report)
- `src/lib/pdf/index.tsx` — `renderInspectionReportPdf()`, memanggil
  `renderToBuffer()` dari `@react-pdf/renderer`
- `src/services/reports/buildEvidence.ts` — membaca **isi file foto**
  (bukan URL) dari storage untuk di-*embed* langsung ke PDF
- `src/config/company.ts` — nama/alamat/email/website perusahaan yang
  tampil di header PDF — **ganti sesuai identitas perusahaan asli**

**Catatan sandbox:** PDF ini belum sempat dirender & dibuka secara visual
di lingkungan tempat kode ini ditulis (keterbatasan environment, bukan
keterbatasan library). Setelah `npm install` di komputer kamu, uji dengan
menyelesaikan satu inspeksi lalu klik salah satu tombol Generate Report —
kalau ada penyesuaian layout kecil yang diperlukan (spacing, ukuran font),
edit langsung di `src/lib/pdf/theme.ts` atau komponen terkait.

### 6.2 Object Storage — `src/lib/storage/index.ts`
Default: filesystem lokal lewat endpoint `/api/uploads/[...key]` (folder
`uploads/` di root proyek, otomatis dibuat, **jangan** commit ke git — sudah
ada di `.gitignore`). Untuk produksi, ganti isi `uploadPhoto`, `uploadReport`,
`getPhotoUrl`, `getReportUrl` dengan SDK provider pilihan (S3/R2/Supabase
Storage) — pemanggil di service/route lain **tidak perlu diubah** karena
semua akses lewat modul ini.

### 6.3 UI edit Master SOP — ✅ SUDAH DIIMPLEMENTASIKAN

Halaman `/sop` sekarang interaktif untuk role **Admin** (Inspector tetap
melihat versi read-only seperti sebelumnya):

- **Edit section** — ubah nama, aktif/nonaktifkan (soft delete, section
  nonaktif tidak dipakai lagi saat inspeksi baru dibuat, tapi data lama
  tidak terpengaruh).
- **Tambah section baru** — tombol "+ Tambah Section Baru" di paling bawah.
- **Edit item** — ubah nama, tipe input, toggle wajib/boleh-notes/boleh-
  foto/boleh-finding, aktif/nonaktifkan.
- **Tambah item baru** — tombol "+ Tambah Item" di tiap section.

File terkait: `src/components/sop/` (`SopManager`, `SectionCard`,
`ItemEditor`, `AddItemForm`, `AddSectionForm`).

Validasi Zod untuk update (`updateSopSectionSchema`, `updateSopItemSchema`)
juga baru ditambahkan di `src/lib/validation/schemas.ts` — sebelumnya
endpoint PATCH menerima body mentah tanpa validasi.

**Penting — konsisten dengan desain snapshot:** mengubah/menonaktifkan
item di Master SOP **tidak mengubah** inspeksi yang sedang berjalan atau
yang sudah selesai, karena setiap inspeksi bekerja dari salinan
(`ItemSnapshot`) yang dibuat saat inspeksi dimulai. Perubahan hanya
berlaku untuk inspeksi **baru** yang dibuat setelahnya.

Belum ada di V1 ini: hapus permanen (by design — pakai nonaktifkan saja
supaya snapshot lama tetap valid), dan reorder drag-and-drop
(`displayOrder` saat ini otomatis mengikuti urutan tambah).

### 6.4 Upload foto dari UI — ✅ SUDAH DIIMPLEMENTASIKAN

`src/components/inspection/PhotoUploader.tsx` — komponen upload foto
langsung dari kamera/galeri HP (`<input type="file" accept="image/*"
capture="environment">`), dipakai di dua tempat:

- **Foto per item checklist** — muncul otomatis di bawah item saat kondisi
  🟡 Perhatian / 🔴 Bermasalah dipilih (mengikuti `allowsPhoto` dari SOP).
- **Foto per Important Finding** — setiap finding yang sudah dibuat kini
  tampil sebagai kartu di bawah item-nya (lengkap dengan badge severity &
  tombol hapus finding), masing-masing punya slot foto sendiri.

Alur upload: **presign → PUT file ke storage → simpan metadata → refresh**.
Ada validasi dasar di sisi klien (harus file gambar, maksimal 8MB) dan
tombol hapus (ikon ❌ di pojok thumbnail) yang memanggil
`DELETE /api/photos/:id` (baru ditambahkan — sekaligus menghapus file fisik
di storage lewat `deletePhoto()`).

Catatan: `src/lib/storage/index.ts` sekarang **sudah** mengimplementasikan
`uploadPhoto`/`deletePhoto` untuk mode lokal (sebelumnya stub) — endpoint
`GET /api/uploads/[...key]` juga sudah mengembalikan `Content-Type` yang
benar (dideteksi dari ekstensi file) supaya thumbnail tampil dengan baik
di browser.

### 6.5 Halaman Review (role Admin mereview hasil inspector) — ✅ SUDAH DIIMPLEMENTASIKAN

Menu **"Review"** baru di navbar (hanya tampil untuk Admin) membuka
`/review`, berisi:

- **Menunggu Review** — daftar inspeksi berstatus `COMPLETED`, dengan
  tombol "Tandai Sudah Direview" yang mengubah status menjadi `REVIEWED`
  (`POST /api/inspections/:id/review`, `src/services/inspections/reviewInspection.ts`).
- **Riwayat Sudah Direview** — 20 inspeksi terakhir yang sudah `REVIEWED`.

**Keterbatasan yang perlu kamu tahu (belum ada di skema database):**
review saat ini **hanya transisi status**, belum menyimpan *siapa* admin
yang mereview, *kapan*, atau *catatan* dari reviewer. Kalau kamu butuh
jejak audit itu, tambahkan kolom baru ke model `Inspection` di
`prisma/schema.prisma` (misal `reviewedById`, `reviewedAt`, `reviewNotes`)
lalu migration ulang (`npm run db:migrate`), dan sesuaikan
`reviewInspection.ts` + halaman `/review`.

Catatan lain: Admin saat ini tetap bisa mengedit checklist inspeksi
kapan pun (termasuk yang sudah `REVIEWED`) — lihat logika `canEdit` di
`InspectionWorkspace.tsx`. Ini keputusan desain V1 (admin override), bukan
bug; ubah kalau kamu ingin status `REVIEWED` benar-benar dikunci.

---

## 7. Catatan Teknis Sandbox

Prisma sempat saya downgrade dari versi terbaru (v8, produk berbeda) ke
**v6.19.3** (classic CLI, sesuai ekspektasi dokumen: `migrate`, `studio`,
`generate`). Di lingkungan sandbox tempat proyek ini dibuat, binary engine
Prisma tidak bisa diunduh (jaringan terbatas) sehingga `prisma generate`
belum sempat dijalankan & divalidasi di sana — **ini akan berjalan normal**
begitu kamu `npm install` di komputer sendiri dengan akses internet biasa.
Kalau menemukan error kecil terkait ini saat pertama kali setup, jalankan
ulang `npm run db:generate`.

---

## 8. Kredensial Default (development)

| Role | Email | Password |
|---|---|---|
| Admin | admin@inspeksi.local | Admin12345! |
| Inspector | inspector@inspeksi.local | Inspector12345! |

Wajib diganti sebelum dipakai dengan data client sungguhan.
