export type ReportSectionSummary = {
  code: string;
  name: string;
  good: number;
  attention: number;
  problem: number;
  na: number;
  score: number | null;
  conclusion: string | null;
};

export type ReportFinding = {
  section: string;
  item: string;
  severity: "ATTENTION" | "PROBLEM";
  description: string | null;
  recommendation: string | null;
  estimatedCostMin: number | null;
  estimatedCostMax: number | null;
  photoUrls: string[];
};

export type ReportData = {
  inspectionId: string;
  inspectionNumber: string;
  inspectionDate: string;
  inspectionLocation: string | null;
  inspector: { name: string };
  client: { name: string; phone: string | null; email: string | null };
  vehicle: {
    plateNumber: string;
    brand: string;
    model: string;
    manufactureYear: number | null;
    mileage: number | null;
  };
  overallScore: number | null;
  overallCondition: string | null;
  accidentAssessment: string | null;
  floodAssessment: string | null;
  finalRecommendation: string | null;
  conclusion: string | null;
  conditionSummary: { good: number; attention: number; problem: number; na: number };
  sections: ReportSectionSummary[];
  importantFindings: ReportFinding[];
  repairCostSummary: { min: number; max: number };
};

export type DetailedReportItem = {
  code: string;
  name: string;
  inputType: string;
  condition: string | null;
  notes: string | null;
  technicalValue: string | null;
  technicalUnit: string | null;
  diagnostics: Array<{ code: string; description: string | null; notes: string | null }>;
  photoCount: number;
};

export type DetailedReportSection = {
  code: string;
  name: string;
  items: DetailedReportItem[];
};

/** Foto bukti (evidence) untuk finding — buffer dibaca langsung dari storage. */
export type EvidencePhoto = {
  section: string;
  item: string;
  severity: "ATTENTION" | "PROBLEM";
  caption: string | null;
  buffer: Buffer;
};
