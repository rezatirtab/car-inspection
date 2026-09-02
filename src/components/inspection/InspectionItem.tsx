"use client";

import { useEffect, useState } from "react";
import { ConditionSelector } from "./ConditionSelector";
import { Textarea, Input } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { PhotoUploader, type PhotoData } from "./PhotoUploader";
import { Badge } from "@/components/ui/Badge";
import { SEVERITY_LABEL } from "@/config/constants";

type Condition = "GOOD" | "ATTENTION" | "PROBLEM" | "NA";

export type ItemFindingData = {
  id: string;
  title: string;
  severity: "ATTENTION" | "PROBLEM";
  description: string | null;
  recommendation: string | null;
  photos: PhotoData[];
};

export type InspectionItemData = {
  itemSnapshotId: string;
  resultId: string | null;
  code: string;
  name: string;
  inputType: "CONDITION" | "CONDITION_PERCENTAGE" | "CONDITION_TEXT" | "AVAILABILITY" | "DIAGNOSTIC";
  allowsNotes: boolean;
  allowsPhoto: boolean;
  condition: Condition | null;
  notes: string | null;
  technicalValue: string | null;
  photos: PhotoData[];
  findings: ItemFindingData[];
};

/**
 * Mengikuti "SYSTEM BEHAVIOR" pada dokumen Decision Matrix:
 * GREEN -> langsung Next tanpa form tambahan.
 * YELLOW -> notes opsional, foto jika perlu.
 * RED -> notes WAJIB (validasi di server), foto sangat disarankan.
 * N/A -> tidak perlu form tambahan.
 */
export function InspectionItem({
  inspectionId,
  item,
  canEdit = true,
  onSave,
  onAddFinding,
  onDeleteFinding,
}: {
  inspectionId: string;
  item: InspectionItemData;
  canEdit?: boolean;
  onSave: (payload: {
    condition: Condition;
    notes?: string;
    technicalValue?: string;
  }) => Promise<void>;
  onAddFinding?: () => void;
  onDeleteFinding?: (findingId: string) => void;
}) {
  const [condition, setCondition] = useState<Condition | null>(item.condition);
  const [notes, setNotes] = useState(item.notes ?? "");
  const [technicalValue, setTechnicalValue] = useState(item.technicalValue ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Autosave dengan debounce untuk perubahan teks (300-500ms).
  useEffect(() => {
    if (!condition) return;
    if (condition === "GOOD" || condition === "NA") return; // sudah disimpan langsung saat klik
    const timer = setTimeout(() => {
      handleSave(condition);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, technicalValue]);

  async function handleSave(nextCondition: Condition) {
    setSaving(true);
    setError(null);
    try {
      await onSave({
        condition: nextCondition,
        notes: notes || undefined,
        technicalValue: technicalValue || undefined,
      });
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  function handleConditionChange(next: Condition) {
    if (!canEdit) return;
    setCondition(next);
    // GOOD & NA langsung tersimpan tanpa form tambahan.
    if (next === "GOOD" || next === "NA") {
      handleSave(next);
    }
  }

  const showTechnicalInput = item.inputType === "CONDITION_PERCENTAGE";
  const showNotesInput = condition === "ATTENTION" || condition === "PROBLEM";
  const showItemPhotoUploader = item.allowsPhoto && item.resultId && (condition === "ATTENTION" || condition === "PROBLEM");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-mono text-slate-400">{item.code}</p>
          <p className="font-medium text-slate-900">{item.name}</p>
        </div>
        {saving && <span className="text-xs text-slate-400">Menyimpan...</span>}
        {!saving && savedAt && <span className="text-xs text-green-600">Tersimpan</span>}
      </div>

      <ConditionSelector value={condition} onChange={handleConditionChange} disabled={saving || !canEdit} />

      {showTechnicalInput && (condition === "ATTENTION" || condition === "PROBLEM" || condition === "GOOD") && (
        <div className="mt-3">
          <Input
            placeholder="Nilai (contoh: 80%)"
            value={technicalValue}
            onChange={(e) => setTechnicalValue(e.target.value)}
            onBlur={() => condition && handleSave(condition)}
            disabled={!canEdit}
          />
        </div>
      )}

      {showNotesInput && (
        <div className="mt-3">
          <Textarea
            placeholder={
              condition === "PROBLEM"
                ? "Wajib diisi — jelaskan temuan pada item ini."
                : "Catatan (opsional)..."
            }
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={!canEdit}
          />
        </div>
      )}

      {showItemPhotoUploader && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-medium text-slate-500">Foto Item</p>
          <PhotoUploader
            inspectionId={inspectionId}
            target={{ resultId: item.resultId! }}
            photos={item.photos}
            disabled={!canEdit}
          />
        </div>
      )}

      {condition === "PROBLEM" && onAddFinding && canEdit && (
        <div className="mt-3">
          <Button type="button" variant="danger" size="sm" onClick={onAddFinding}>
            + Buat Finding
          </Button>
        </div>
      )}

      {item.findings.length > 0 && (
        <div className="mt-3 space-y-2">
          {item.findings.map((finding) => (
            <div key={finding.id} className="rounded-lg border border-red-100 bg-red-50/40 p-3">
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-slate-900">{finding.title}</p>
                    <Badge tone={finding.severity === "PROBLEM" ? "red" : "yellow"}>
                      {SEVERITY_LABEL[finding.severity]}
                    </Badge>
                  </div>
                  {finding.description && (
                    <p className="mt-0.5 text-xs text-slate-600">{finding.description}</p>
                  )}
                </div>
                {onDeleteFinding && canEdit && (
                  <button
                    type="button"
                    onClick={() => onDeleteFinding(finding.id)}
                    className="shrink-0 text-xs text-slate-400 hover:text-red-600"
                  >
                    Hapus
                  </button>
                )}
              </div>
              <PhotoUploader
                inspectionId={inspectionId}
                target={{ findingId: finding.id }}
                photos={finding.photos}
                disabled={!canEdit}
              />
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
