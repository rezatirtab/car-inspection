-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'INSPECTOR');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'REVIEWED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('GOOD', 'ATTENTION', 'PROBLEM', 'NA');

-- CreateEnum
CREATE TYPE "InputType" AS ENUM ('CONDITION', 'CONDITION_PERCENTAGE', 'CONDITION_TEXT', 'AVAILABILITY', 'DIAGNOSTIC');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('ATTENTION', 'PROBLEM');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('CLIENT_SUMMARY', 'DETAILED_REPORT', 'FULL_REPORT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "vehicleType" TEXT,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "manufactureYear" INTEGER,
    "mileage" INTEGER,
    "color" TEXT,
    "vin" TEXT,
    "engineNumber" TEXT,
    "transmission" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspections" (
    "id" TEXT NOT NULL,
    "inspectionNumber" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "inspectionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inspectionLocation" TEXT,
    "status" "InspectionStatus" NOT NULL DEFAULT 'DRAFT',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_sections" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspection_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_items" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "inputType" "InputType" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "allowsNotes" BOOLEAN NOT NULL DEFAULT true,
    "allowsPhoto" BOOLEAN NOT NULL DEFAULT false,
    "allowsFinding" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspection_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_section_snapshots" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspection_section_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_item_snapshots" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "sectionSnapshotId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "inputType" "InputType" NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "allowsNotes" BOOLEAN NOT NULL,
    "allowsPhoto" BOOLEAN NOT NULL,
    "allowsFinding" BOOLEAN NOT NULL,

    CONSTRAINT "inspection_item_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_results" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "itemSnapshotId" TEXT NOT NULL,
    "condition" "Condition" NOT NULL,
    "notes" TEXT,
    "technicalValue" TEXT,
    "technicalUnit" TEXT,
    "isFinding" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspection_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_diagnostics" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspection_diagnostics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_findings" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "resultId" TEXT,
    "severity" "Severity" NOT NULL,
    "priority" "Priority",
    "title" TEXT NOT NULL,
    "description" TEXT,
    "recommendation" TEXT,
    "estimatedCostMin" DECIMAL(15,2),
    "estimatedCostMax" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspection_findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_photos" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "resultId" TEXT,
    "findingId" TEXT,
    "storageKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspection_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_section_results" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "sectionSnapshotId" TEXT NOT NULL,
    "sectionScore" DECIMAL(5,2),
    "conclusion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspection_section_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "final_assessments" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "overallScore" DECIMAL(5,2),
    "overallCondition" "Condition",
    "accidentAssessment" TEXT,
    "floodAssessment" TEXT,
    "finalRecommendation" TEXT,
    "conclusion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "final_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_reports" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "reportType" "ReportType" NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspection_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "vehicles_plateNumber_idx" ON "vehicles"("plateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "inspections_inspectionNumber_key" ON "inspections"("inspectionNumber");

-- CreateIndex
CREATE INDEX "inspections_clientId_idx" ON "inspections"("clientId");

-- CreateIndex
CREATE INDEX "inspections_vehicleId_idx" ON "inspections"("vehicleId");

-- CreateIndex
CREATE INDEX "inspections_inspectorId_idx" ON "inspections"("inspectorId");

-- CreateIndex
CREATE INDEX "inspections_status_idx" ON "inspections"("status");

-- CreateIndex
CREATE UNIQUE INDEX "inspection_sections_code_key" ON "inspection_sections"("code");

-- CreateIndex
CREATE INDEX "inspection_items_sectionId_idx" ON "inspection_items"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "inspection_items_sectionId_code_key" ON "inspection_items"("sectionId", "code");

-- CreateIndex
CREATE INDEX "inspection_section_snapshots_inspectionId_idx" ON "inspection_section_snapshots"("inspectionId");

-- CreateIndex
CREATE INDEX "inspection_item_snapshots_inspectionId_idx" ON "inspection_item_snapshots"("inspectionId");

-- CreateIndex
CREATE INDEX "inspection_item_snapshots_sectionSnapshotId_idx" ON "inspection_item_snapshots"("sectionSnapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "inspection_results_itemSnapshotId_key" ON "inspection_results"("itemSnapshotId");

-- CreateIndex
CREATE INDEX "inspection_results_inspectionId_idx" ON "inspection_results"("inspectionId");

-- CreateIndex
CREATE INDEX "inspection_diagnostics_resultId_idx" ON "inspection_diagnostics"("resultId");

-- CreateIndex
CREATE INDEX "inspection_findings_inspectionId_idx" ON "inspection_findings"("inspectionId");

-- CreateIndex
CREATE INDEX "inspection_findings_resultId_idx" ON "inspection_findings"("resultId");

-- CreateIndex
CREATE INDEX "inspection_photos_inspectionId_idx" ON "inspection_photos"("inspectionId");

-- CreateIndex
CREATE INDEX "inspection_photos_resultId_idx" ON "inspection_photos"("resultId");

-- CreateIndex
CREATE INDEX "inspection_photos_findingId_idx" ON "inspection_photos"("findingId");

-- CreateIndex
CREATE UNIQUE INDEX "inspection_section_results_inspectionId_sectionSnapshotId_key" ON "inspection_section_results"("inspectionId", "sectionSnapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "final_assessments_inspectionId_key" ON "final_assessments"("inspectionId");

-- CreateIndex
CREATE INDEX "inspection_reports_inspectionId_idx" ON "inspection_reports"("inspectionId");

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_items" ADD CONSTRAINT "inspection_items_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "inspection_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_section_snapshots" ADD CONSTRAINT "inspection_section_snapshots_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_item_snapshots" ADD CONSTRAINT "inspection_item_snapshots_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_item_snapshots" ADD CONSTRAINT "inspection_item_snapshots_sectionSnapshotId_fkey" FOREIGN KEY ("sectionSnapshotId") REFERENCES "inspection_section_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_item_snapshots" ADD CONSTRAINT "inspection_item_snapshots_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inspection_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_results" ADD CONSTRAINT "inspection_results_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_results" ADD CONSTRAINT "inspection_results_itemSnapshotId_fkey" FOREIGN KEY ("itemSnapshotId") REFERENCES "inspection_item_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_diagnostics" ADD CONSTRAINT "inspection_diagnostics_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "inspection_results"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_findings" ADD CONSTRAINT "inspection_findings_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_findings" ADD CONSTRAINT "inspection_findings_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "inspection_results"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_photos" ADD CONSTRAINT "inspection_photos_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_photos" ADD CONSTRAINT "inspection_photos_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "inspection_results"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_photos" ADD CONSTRAINT "inspection_photos_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "inspection_findings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_section_results" ADD CONSTRAINT "inspection_section_results_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_section_results" ADD CONSTRAINT "inspection_section_results_sectionSnapshotId_fkey" FOREIGN KEY ("sectionSnapshotId") REFERENCES "inspection_section_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "final_assessments" ADD CONSTRAINT "final_assessments_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_reports" ADD CONSTRAINT "inspection_reports_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
