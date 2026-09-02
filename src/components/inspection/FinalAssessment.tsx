"use client";

import { useState } from "react";
import { Label, Select, Textarea } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import {
  ACCIDENT_ASSESSMENT_OPTIONS,
  FLOOD_ASSESSMENT_OPTIONS,
  OVERALL_CONDITION_OPTIONS,
  FINAL_RECOMMENDATION_OPTIONS,
} from "@/config/constants";

export type FinalAssessmentValue = {
  overallCondition?: "GOOD" | "ATTENTION" | "PROBLEM";
  accidentAssessment?: string;
  floodAssessment?: string;
  finalRecommendation?: string;
  conclusion?: string;
};

export function FinalAssessmentForm({
  systemRecommendedCondition,
  initialValue,
  onSubmit,
}: {
  /** Rekomendasi sistem (draft), inspector tetap yang mengonfirmasi final. */
  systemRecommendedCondition?: "GOOD" | "ATTENTION" | "PROBLEM" | null;
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

      {systemRecommendedCondition && (
        <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
          Rekomendasi sistem (draft, berdasarkan skor):{" "}
          <strong>
            {OVERALL_CONDITION_OPTIONS.find((o) => o.value === systemRecommendedCondition)?.label ??
              systemRecommendedCondition}
          </strong>
          . Silakan konfirmasi atau ubah sesuai penilaian Anda.
        </p>
      )}

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
