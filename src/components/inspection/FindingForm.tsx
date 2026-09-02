"use client";

import { useState } from "react";
import { Label, Input, Textarea, Select } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";

export type FindingFormValue = {
  severity: "ATTENTION" | "PROBLEM";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  description?: string;
  recommendation?: string;
  estimatedCostMin?: number;
  estimatedCostMax?: number;
};

export function FindingForm({
  initialSeverity = "PROBLEM",
  onSubmit,
  onCancel,
}: {
  initialSeverity?: "ATTENTION" | "PROBLEM";
  onSubmit: (value: FindingFormValue) => Promise<void>;
  onCancel: () => void;
}) {
  const [value, setValue] = useState<FindingFormValue>({
    severity: initialSeverity,
    title: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.title.trim()) {
      setError("Judul temuan wajib diisi.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan finding.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <h4 className="font-semibold text-slate-900">Buat Important Finding</h4>

      <div>
        <Label required>Judul Temuan</Label>
        <Input
          value={value.title}
          onChange={(e) => setValue((v) => ({ ...v, title: e.target.value }))}
          placeholder="Contoh: Transmission shifting problem"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Severity</Label>
          <Select
            value={value.severity}
            onChange={(e) =>
              setValue((v) => ({ ...v, severity: e.target.value as "ATTENTION" | "PROBLEM" }))
            }
          >
            <option value="ATTENTION">🟡 Perhatian</option>
            <option value="PROBLEM">🔴 Bermasalah</option>
          </Select>
        </div>
        <div>
          <Label>Priority</Label>
          <Select
            value={value.priority ?? ""}
            onChange={(e) =>
              setValue((v) => ({ ...v, priority: (e.target.value || undefined) as FindingFormValue["priority"] }))
            }
          >
            <option value="">-- Pilih --</option>
            <option value="LOW">Rendah</option>
            <option value="MEDIUM">Sedang</option>
            <option value="HIGH">Tinggi</option>
            <option value="CRITICAL">Kritis</option>
          </Select>
        </div>
      </div>

      <div>
        <Label>Deskripsi Temuan</Label>
        <Textarea
          value={value.description ?? ""}
          onChange={(e) => setValue((v) => ({ ...v, description: e.target.value }))}
        />
      </div>

      <div>
        <Label>Rekomendasi</Label>
        <Textarea
          value={value.recommendation ?? ""}
          onChange={(e) => setValue((v) => ({ ...v, recommendation: e.target.value }))}
        />
      </div>

      <div>
        <Label>Estimated Repair Cost — Indicative Only</Label>
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            placeholder="Minimum (Rp)"
            onChange={(e) =>
              setValue((v) => ({ ...v, estimatedCostMin: e.target.value ? Number(e.target.value) : undefined }))
            }
          />
          <Input
            type="number"
            placeholder="Maximum (Rp)"
            onChange={(e) =>
              setValue((v) => ({ ...v, estimatedCostMax: e.target.value ? Number(e.target.value) : undefined }))
            }
          />
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Angka ini bersifat estimasi/indikatif, bukan quotation resmi.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Batal
        </Button>
        <Button type="submit" variant="danger" disabled={submitting}>
          {submitting ? "Menyimpan..." : "Simpan Finding"}
        </Button>
      </div>
    </form>
  );
}
