"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select, Label } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export type SopItemData = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  inputType: "CONDITION" | "CONDITION_PERCENTAGE" | "CONDITION_TEXT" | "AVAILABILITY" | "DIAGNOSTIC";
  isRequired: boolean;
  allowsNotes: boolean;
  allowsPhoto: boolean;
  allowsFinding: boolean;
  isActive: boolean;
  displayOrder: number;
};

const INPUT_TYPE_LABEL: Record<SopItemData["inputType"], string> = {
  CONDITION: "Kondisi (Baik/Perhatian/Bermasalah/N-A)",
  CONDITION_PERCENTAGE: "Kondisi + Persentase",
  CONDITION_TEXT: "Kondisi + Teks Bebas",
  AVAILABILITY: "Ketersediaan (ada/tidak)",
  DIAGNOSTIC: "Diagnostic Scan (DTC)",
};

export function ItemEditor({
  item,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  reordering,
}: {
  item: SopItemData;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  reordering?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(item.name);
  const [inputType, setInputType] = useState(item.inputType);
  const [isRequired, setIsRequired] = useState(item.isRequired);
  const [allowsNotes, setAllowsNotes] = useState(item.allowsNotes);
  const [allowsPhoto, setAllowsPhoto] = useState(item.allowsPhoto);
  const [allowsFinding, setAllowsFinding] = useState(item.allowsFinding);

  async function patchItem(body: Record<string, unknown>) {
    const res = await fetch(`/api/sop/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message ?? "Gagal menyimpan.");
    return json.data.item;
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await patchItem({ name, inputType, isRequired, allowsNotes, allowsPhoto, allowsFinding });
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive() {
    setSaving(true);
    setError(null);
    try {
      await patchItem({ isActive: !item.isActive });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <li className="flex items-center justify-between gap-3 py-2.5 text-sm">
        <div className="flex shrink-0 flex-col gap-0.5">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp || reordering}
            title="Pindah ke atas"
            className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-20"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown || reordering}
            title="Pindah ke bawah"
            className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-20"
          >
            ▼
          </button>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium text-slate-800">{item.name}</span>
            {!item.isActive && <Badge tone="gray">Nonaktif</Badge>}
            {item.isRequired && item.isActive && <Badge tone="blue">Wajib</Badge>}
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            {item.code} · {INPUT_TYPE_LABEL[item.inputType]}
            {item.allowsPhoto ? " · Foto" : ""}
            {item.allowsFinding ? " · Finding" : ""}
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={handleToggleActive} disabled={saving}>
            {item.isActive ? "Nonaktifkan" : "Aktifkan"}
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li className="space-y-3 rounded-lg border border-blue-100 bg-blue-50/40 p-3">
      <div>
        <Label>Nama Item</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <Label>Tipe Input</Label>
        <Select value={inputType} onChange={(e) => setInputType(e.target.value as SopItemData["inputType"])}>
          {Object.entries(INPUT_TYPE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-wrap gap-4 text-sm text-slate-700">
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={isRequired} onChange={(e) => setIsRequired(e.target.checked)} />
          Wajib diisi
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={allowsNotes} onChange={(e) => setAllowsNotes(e.target.checked)} />
          Boleh notes
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={allowsPhoto} onChange={(e) => setAllowsPhoto(e.target.checked)} />
          Boleh foto
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={allowsFinding} onChange={(e) => setAllowsFinding(e.target.checked)} />
          Boleh finding
        </label>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)} disabled={saving}>
          Batal
        </Button>
        <Button type="button" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </li>
  );
}
