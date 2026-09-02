"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select, Label } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import type { SopItemData } from "./ItemEditor";

const INPUT_TYPE_LABEL: Record<SopItemData["inputType"], string> = {
  CONDITION: "Kondisi (Baik/Perhatian/Bermasalah/N-A)",
  CONDITION_PERCENTAGE: "Kondisi + Persentase",
  CONDITION_TEXT: "Kondisi + Teks Bebas",
  AVAILABILITY: "Ketersediaan (ada/tidak)",
  DIAGNOSTIC: "Diagnostic Scan (DTC)",
};

export function AddItemForm({
  sectionId,
  nextDisplayOrder,
  onDone,
}: {
  sectionId: string;
  nextDisplayOrder: number;
  onDone: () => void;
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [inputType, setInputType] = useState<SopItemData["inputType"]>("CONDITION");
  const [allowsPhoto, setAllowsPhoto] = useState(true);
  const [allowsFinding, setAllowsFinding] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setError("Kode dan nama item wajib diisi.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/sop/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId,
          code: code.toUpperCase(),
          name,
          inputType,
          allowsPhoto,
          allowsFinding,
          displayOrder: nextDisplayOrder,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Gagal menambah item.");
      router.refresh();
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambah item.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-dashed border-slate-300 p-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required>Kode</Label>
          <Input
            placeholder="Contoh: EXT-BPD"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <div>
          <Label required>Nama Item</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
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
      <div className="flex gap-4 text-sm text-slate-700">
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
        <Button type="button" size="sm" variant="outline" onClick={onDone} disabled={saving}>
          Batal
        </Button>
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Menyimpan..." : "Tambah Item"}
        </Button>
      </div>
    </form>
  );
}
