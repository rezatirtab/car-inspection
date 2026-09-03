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
- `DATABASE_URL` dan `DIRECT_URL` — untuk development lokal, isi keduanya
  dengan URL PostgreSQL yang sama.
- `AUTH_SECRET` — isi string acak minimal 32 karakter. Generate dengan:
  ```bash
  openssl rand -base64 32
  ```
- Bagian `STORAGE` (Supabase) **biarkan kosong** untuk development —
  aplikasi otomatis pakai folder lokal `uploads/`. Isi ini hanya
  diperlukan saat deploy ke production (lihat bagian 9).

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

---

## 9. Deploy ke Production (Vercel + Supabase)

Panduan ini pakai kombinasi **Vercel** (hosting Next.js) + **Supabase**
(Database PostgreSQL + Storage foto/PDF) — dipilih karena cukup **1 akun**
untuk semuanya, dan keduanya punya paket gratis yang cukup untuk mulai.
Kamu **tidak perlu** membuat akun GitHub/Vercel baru kalau sudah punya —
tinggal pakai yang sudah ada.

### 9.1 Buat project Supabase

1. Buka [supabase.com](https://supabase.com) → New Project. Catat
   password database yang kamu buat (dibutuhkan di langkah berikutnya).
2. Setelah project jadi, buka **Project Settings → Database → Connection
   string**. Kamu akan lihat beberapa mode koneksi — catat dua ini:
   - **Transaction pooler** (biasanya port `6543`) → ini untuk
     `DATABASE_URL`. Tambahkan `?pgbouncer=true` di akhir URL-nya.
   - **Direct connection** (port `5432`) → ini untuk `DIRECT_URL`.
3. Buka **Storage** (menu kiri) → **New bucket** → beri nama
   `vehicle-inspection` (atau sesukamu, nanti disamakan di env var) →
   **PENTING: pilih Private**, bukan Public (foto kendaraan client tidak
   untuk konsumsi publik).
4. Buka **Project Settings → API** → catat:
   - **Project URL** → untuk `SUPABASE_URL`
   - **service_role key** (bagian "Project API keys", BUKAN yang
     `anon`/`public`) → untuk `SUPABASE_SERVICE_ROLE_KEY`. Key ini rahasia,
     jangan sampai bocor ke kode sisi klien.

### 9.2 Migrasi database ke Supabase (dari laptop kamu)

Sebelum deploy, siapkan skema database di Supabase dengan menjalankan
migration dari komputer kamu sendiri (Vercel tidak menyediakan akses
shell untuk menjalankan perintah seperti ini):

```bash
# Isi .env SEMENTARA dengan DATABASE_URL & DIRECT_URL dari Supabase
# (boleh pakai file .env yang sama, atau .env.production terpisah)
npm run db:migrate:deploy   # lihat catatan di bawah kalau script ini belum ada
npm run db:seed             # opsional — isi Master SOP + akun awal
```

> Catatan: `package.json` proyek ini sudah punya script `db:deploy` yang
> menjalankan `prisma migrate deploy` (migration tanpa prompt interaktif,
> cocok untuk non-development). Jalankan `npm run db:deploy` untuk migrasi
> ke Supabase, bukan `npm run db:migrate` (yang itu untuk development).

### 9.3 Push kode ke GitHub

Kalau proyek ini belum ada di GitHub:

```bash
cd car-inspection
git init
git add .
git commit -m "Initial commit"
# Buat repo baru di github.com, lalu:
git remote add origin https://github.com/<username>/<nama-repo>.git
git branch -M main
git push -u origin main
```

### 9.4 Import ke Vercel & isi environment variables

1. Buka [vercel.com](https://vercel.com) → **Add New → Project** → pilih
   repo GitHub yang barusan dibuat.
2. Framework Preset otomatis terdeteksi **Next.js** — tidak perlu ubah
   build command.
3. Di bagian **Environment Variables**, isi semua ini (nilai dari langkah
   9.1, bukan yang di `.env.example`):

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | connection string **Transaction pooler** Supabase |
   | `DIRECT_URL` | connection string **Direct connection** Supabase |
   | `AUTH_SECRET` | string acak baru (JANGAN pakai yang sama dengan development — generate ulang: `openssl rand -base64 32`) |
   | `SUPABASE_URL` | Project URL Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key Supabase |
   | `SUPABASE_STORAGE_BUCKET` | nama bucket (`vehicle-inspection`) |
   | `NODE_ENV` | `production` |

4. Klik **Deploy**. Tunggu build selesai.

### 9.5 Setelah deploy pertama kali

- Buka domain Vercel yang diberikan (`https://<nama-project>.vercel.app`)
  → coba login pakai akun dari hasil `npm run db:seed` di langkah 9.2.
- **Segera ganti password akun default** (belum ada halaman ganti password
  di V1 ini — sementara update manual lewat database, atau tambahkan
  fitur ganti password kalau dibutuhkan).
- Setiap kali kamu push commit baru ke branch `main`, Vercel otomatis
  build & deploy ulang. Kalau ada perubahan `prisma/schema.prisma`,
  jalankan `npm run db:deploy` dari laptop kamu (mengarah ke Supabase)
  **sebelum** atau **setelah** push kode — migration database tidak
  otomatis jalan saat Vercel build.

### 9.6 Hal-hal yang perlu diperhatikan di production

1. **Batas ukuran upload foto.** Vercel Serverless Functions (paket
   Hobby/Pro) punya batas ukuran request body sekitar 4.5MB. Aplikasi ini
   membatasi ukuran foto di sisi klien 8MB (lihat `PhotoUploader.tsx`) —
   yang di atas ~4.5MB berpotensi gagal di Vercel meski lolos validasi
   klien. Kalau ini jadi masalah nyata, turunkan batas di
   `PhotoUploader.tsx` (`MAX_FILE_SIZE`) jadi lebih kecil (misal 4MB), atau
   tambahkan kompresi gambar di sisi klien sebelum upload.
2. **Signed URL foto kedaluwarsa dalam 1 jam** (`getPhotoUrl`/
   `getReportUrl` di `src/lib/storage/index.ts`) — ini supaya foto client
   tidak bisa diakses sembarang orang meski link-nya bocor. Kalau butuh
   durasi lain, ubah angka `60 * 60` di file tersebut.
3. **Cold start.** Generate PDF (`@react-pdf/renderer`) agak berat untuk
   serverless function — kalau terasa lambat di percobaan pertama setelah
   idle lama, itu wajar (cold start), request berikutnya akan lebih cepat.
4. **Backup database** — Supabase paket gratis punya retensi backup
   terbatas. Kalau data client sudah nyata/penting, pertimbangkan upgrade
   paket atau atur backup manual berkala.

---

## 10. Fitur Tambahan: Branding OTORIZ, Foto Kendaraan, Navigasi Section, Reorder SOP

Update ini menambahkan 5 hal, salah satunya **mengubah skema database**
(lihat peringatan migration di bawah).

### 10.1 Redesign PDF sesuai brand OTORIZ

- Logo perusahaan (`src/lib/pdf/assets/logo.ts`, disimpan sebagai base64
  langsung di source code — bukan file gambar terpisah — supaya pasti
  ikut ter-bundle di serverless function Vercel) tampil di header setiap
  halaman PDF.
- Watermark logo transparan (opacity 7%, dirotasi) tampil di **semua**
  halaman PDF (Summary, Detailed Checklist, Evidence Appendix) —
  `src/lib/pdf/components/Watermark.tsx`.
- Warna tema PDF diganti dari biru ke gold/bronze sesuai brand
  (`src/lib/pdf/theme.ts` → `PDF_COLORS.primary = "#A07635"`).
- Info perusahaan (`src/config/company.ts`) sudah diisi data OTORIZ CAR
  INSPECTION (Jakarta, dharmagroup23@gmail.com, +62 851 1782 3062).
- Penting foto Important Finding sekarang tampil sebagai **thumbnail
  kecil** (34×34) di sisi kanan tiap baris finding pada halaman Summary —
  foto ukuran penuh tetap ada terpisah di halaman Evidence Appendix
  (khusus report type Full Report).

### 10.2 Foto Profil Kendaraan

- Field baru `vehiclePhotoStorageKey` di model `Inspection` — **1 foto
  opsional** per inspeksi, diisi saat mengisi "Data Kendaraan" di form
  Inspeksi Baru (`VehiclePhotoPicker.tsx`), diupload otomatis setelah
  inspeksi berhasil dibuat.
- Foto ini tampil di kotak "Foto Unit" pada header Client Summary PDF.
- Kalau upload foto gagal (jaringan lambat dsb.), pembuatan inspeksi
  **tetap berhasil** — foto profil bersifat opsional, inspector tidak
  terblokir.

### 10.3 Navigasi Section dengan Panah

- Tombol panah ← → di samping tab section pada halaman kerja inspeksi.
- Shortcut keyboard: tombol panah kiri/kanan di keyboard juga berfungsi
  pindah section (otomatis nonaktif kalau fokus sedang di kolom
  input/textarea/select, supaya tidak mengganggu pengetikan notes).

### 10.4 Reorder Item Master SOP

- Tombol ▲▼ di setiap baris item pada halaman Master SOP (Admin) —
  menukar `displayOrder` dengan item tetangga di section yang sama.
- **Cakupan saat ini: reorder ITEM di dalam 1 section saja.** Urutan
  section itu sendiri (section mana tampil duluan) belum bisa diubah
  lewat UI — kalau nanti dibutuhkan, tinggal tambahkan tombol serupa di
  header section (`SectionCard.tsx`) yang PATCH `displayOrder` section
  lewat `/api/sop/sections/:id`.

### ⚠️ WAJIB: Migration database sebelum menjalankan update ini

Field `vehiclePhotoStorageKey` itu **baru**, jadi database (baik lokal
maupun production) perlu di-migrate ulang:

```bash
# Development lokal
npx prisma migrate dev --name add_vehicle_photo

# Production (Supabase/Prisma Postgres) — jalankan dari laptop, DATABASE_URL
# & DIRECT_URL di .env harus mengarah ke database production
npm run db:deploy
```

Tidak perlu re-seed — data inspeksi yang sudah ada tetap aman, field baru
ini otomatis `NULL` untuk data lama (kolom optional).
