"use client";

import { useState } from "react";
import { Input, Label, Select, Textarea } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import {
  ACCIDENT_ASSESSMENT_OPTIONS,
  FLOOD_ASSESSMENT_OPTIONS,
  OVERALL_CONDITION_OPTIONS,
  FINAL_RECOMMENDATION_OPTIONS,
} from "@/config/constants";

export type FinalAssessmentValue = {
  /** Diisi manual oleh inspector (0-100), bukan hasil perhitungan otomatis. */
  overallScore?: number;
  overallCondition?: "GOOD" | "ATTENTION" | "PROBLEM";
  accidentAssessment?: string;
  floodAssessment?: string;
  finalRecommendation?: string;
  conclusion?: string;
};

export function FinalAssessmentForm({
  initialValue,
  onSubmit,
}: {
  initialValue?: FinalAssessmentValue;
  onSubmit: (value: FinalAssessmentValue) => Promise<void>;
}) {
  const [value, setValue] = useState<FinalAssessmentValue>(initialValue ?? {});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan final assessment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="font-semibold text-slate-900">Final Vehicle Assessment</h3>

      <div>
        <Label required>Overall Score</Label>
        <Input
          type="number"
          min={0}
          max={100}
          step={1}
          placeholder="0-100"
          value={value.overallScore ?? ""}
          onChange={(e) =>
            setValue((v) => ({
              ...v,
              overallScore: e.target.value === "" ? undefined : Number(e.target.value),
            }))
          }
        />
        <p className="mt-1 text-xs text-slate-400">
          Diisi manual oleh inspector berdasarkan penilaian keseluruhan kendaraan (bukan hasil hitung otomatis dari
          checklist).
        </p>
      </div>

      <div>
        <Label required>Overall Condition</Label>
        <Select
          value={value.overallCondition ?? ""}
          onChange={(e) =>
            setValue((v) => ({ ...v, overallCondition: e.target.value as FinalAssessmentValue["overallCondition"] }))
          }
        >
          <option value="">-- Pilih --</option>
          {OVERALL_CONDITION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Accident Assessment</Label>
        <Select
          value={value.accidentAssessment ?? ""}
          onChange={(e) => setValue((v) => ({ ...v, accidentAssessment: e.target.value }))}
        >
          <option value="">-- Pilih --</option>
          {ACCIDENT_ASSESSMENT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <p className="mt-1 text-xs text-slate-400">
          Sistem tidak menyimpulkan status kecelakaan secara otomatis — ini murni penilaian inspector.
        </p>
      </div>

      <div>
        <Label>Flood Assessment</Label>
        <Select
          value={value.floodAssessment ?? ""}
          onChange={(e) => setValue((v) => ({ ...v, floodAssessment: e.target.value }))}
        >
          <option value="">-- Pilih --</option>
          {FLOOD_ASSESSMENT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Final Recommendation</Label>
        <Select
          value={value.finalRecommendation ?? ""}
          onChange={(e) => setValue((v) => ({ ...v, finalRecommendation: e.target.value }))}
        >
          <option value="">-- Pilih --</option>
          {FINAL_RECOMMENDATION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Inspector Conclusion</Label>
        <Textarea
          value={value.conclusion ?? ""}
          onChange={(e) => setValue((v) => ({ ...v, conclusion: e.target.value }))}
          placeholder="Kesimpulan akhir mengenai kondisi kendaraan..."
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Menyimpan..." : "Simpan Final Assessment"}
      </Button>
    </form>
  );
}
