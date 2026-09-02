import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(6, "Password minimal 6 karakter."),
});

export const createClientSchema = z.object({
  name: z.string().min(1, "Nama customer wajib diisi."),
  phone: z.string().optional(),
  email: z.string().email("Format email tidak valid.").optional().or(z.literal("")),
});

export const updateClientSchema = createClientSchema.partial();

export const createVehicleSchema = z.object({
  plateNumber: z.string().min(1, "Nomor polisi wajib diisi."),
  vehicleType: z.string().optional(),
  brand: z.string().min(1, "Merk wajib diisi."),
  model: z.string().min(1, "Model wajib diisi."),
  manufactureYear: z.number().int().gte(1950).lte(2100).optional(),
  mileage: z.number().int().nonnegative().optional(),
  color: z.string().optional(),
  vin: z.string().optional(),
  engineNumber: z.string().optional(),
  transmission: z.string().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const createInspectionSchema = z.object({
  clientId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  inspectionLocation: z.string().optional(),
});

export const conditionEnum = z.enum(["GOOD", "ATTENTION", "PROBLEM", "NA"]);

export const updateInspectionResultSchema = z.object({
  condition: conditionEnum,
  notes: z.string().optional(),
  technicalValue: z.string().optional(),
  technicalUnit: z.string().optional(),
  diagnostics: z
    .array(
      z.object({
        code: z.string().min(1),
        description: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .optional(),
});

export const createFindingSchema = z.object({
  resultId: z.string().uuid().optional(),
  severity: z.enum(["ATTENTION", "PROBLEM"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  title: z.string().min(1, "Judul temuan wajib diisi."),
  description: z.string().optional(),
  recommendation: z.string().optional(),
  estimatedCostMin: z.number().nonnegative().optional(),
  estimatedCostMax: z.number().nonnegative().optional(),
});

export const updateFindingSchema = createFindingSchema.partial();

export const photoMetadataSchema = z.object({
  resultId: z.string().uuid().optional(),
  findingId: z.string().uuid().optional(),
  storageKey: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  fileSize: z.number().int().positive(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const finalAssessmentSchema = z.object({
  overallCondition: conditionEnum.optional(),
  accidentAssessment: z.string().optional(),
  floodAssessment: z.string().optional(),
  finalRecommendation: z.string().optional(),
  conclusion: z.string().optional(),
});

export const generateReportSchema = z.object({
  type: z.enum(["CLIENT_SUMMARY", "DETAILED_REPORT", "FULL_REPORT"]),
});

export const createSopSectionSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  displayOrder: z.number().int().nonnegative(),
});

export const createSopItemSchema = z.object({
  sectionId: z.string().uuid(),
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  inputType: z.enum([
    "CONDITION",
    "CONDITION_PERCENTAGE",
    "CONDITION_TEXT",
    "AVAILABILITY",
    "DIAGNOSTIC",
  ]),
  isRequired: z.boolean().optional(),
  allowsNotes: z.boolean().optional(),
  allowsPhoto: z.boolean().optional(),
  allowsFinding: z.boolean().optional(),
  displayOrder: z.number().int().nonnegative(),
});

export const updateSopSectionSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

export const updateSopItemSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  inputType: z
    .enum(["CONDITION", "CONDITION_PERCENTAGE", "CONDITION_TEXT", "AVAILABILITY", "DIAGNOSTIC"])
    .optional(),
  isRequired: z.boolean().optional(),
  allowsNotes: z.boolean().optional(),
  allowsPhoto: z.boolean().optional(),
  allowsFinding: z.boolean().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});
