"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Form";
import { ItemEditor, type SopItemData } from "./ItemEditor";
import { AddItemForm } from "./AddItemForm";

export type SopSectionData = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  items: SopItemData[];
};

export function SectionCard({ section }: { section: SopSectionData }) {
  const router = useRouter();
  const [editingHeader, setEditingHeader] = useState(false);
  const [name, setName] = useState(section.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingItem, setAddingItem] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const sortedItems = [...section.items].sort((a, b) => a.displayOrder - b.displayOrder);

  async function patchItem(itemId: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/sop/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message ?? "Gagal menyimpan urutan.");
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sortedItems.length) return;

    const current = sortedItems[index];
    const target = sortedItems[targetIndex];

    setReorderingId(current.id);
    setError(null);
    try {
      // Tukar nilai displayOrder antar 2 item yang bertetangga.
      await patchItem(current.id, { displayOrder: target.displayOrder });
      await patchItem(target.id, { displayOrder: current.displayOrder });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah urutan.");
    } finally {
      setReorderingId(null);
    }
  }

  async function patchSection(body: Record<string, unknown>) {
    const res = await fetch(`/api/sop/sections/${section.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message ?? "Gagal menyimpan.");
    return json.data.section;
  }

  async function handleSaveHeader() {
    setSaving(true);
    setError(null);
    try {
      await patchSection({ name });
      setEditingHeader(false);
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
      await patchSection({ isActive: !section.isActive });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  const nextDisplayOrder =
    sortedItems.length > 0 ? Math.max(...sortedItems.map((i) => i.displayOrder)) + 1 : 1;

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-3">
        {!editingHeader ? (
          <>
            <CardTitle>
              {section.name} <span className="font-mono text-xs text-slate-400">({section.code})</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge tone={section.isActive ? "green" : "gray"}>
                {section.isActive ? "Aktif" : "Nonaktif"}
              </Badge>
              <Button type="button" size="sm" variant="ghost" onClick={() => setEditingHeader(true)}>
                Edit Nama
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={handleToggleActive} disabled={saving}>
                {section.isActive ? "Nonaktifkan" : "Aktifkan"}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex w-full items-end gap-2">
            <div className="flex-1">
              <Label>Nama Section</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <Button type="button" size="sm" variant="outline" onClick={() => setEditingHeader(false)} disabled={saving}>
              Batal
            </Button>
            <Button type="button" size="sm" onClick={handleSaveHeader} disabled={saving}>
              {saving ? "..." : "Simpan"}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardBody>
        {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
        <ul className="divide-y divide-slate-100">
          {sortedItems.map((item, index) => (
            <ItemEditor
              key={item.id}
              item={item}
              canMoveUp={index > 0}
              canMoveDown={index < sortedItems.length - 1}
              onMoveUp={() => handleMove(index, -1)}
              onMoveDown={() => handleMove(index, 1)}
              reordering={reorderingId === item.id}
            />
          ))}
          {section.items.length === 0 && (
            <p className="py-4 text-center text-sm text-slate-400">Belum ada item di section ini.</p>
          )}
        </ul>

        <div className="mt-3">
          {addingItem ? (
            <AddItemForm
              sectionId={section.id}
              nextDisplayOrder={nextDisplayOrder}
              onDone={() => setAddingItem(false)}
            />
          ) : (
            <Button type="button" size="sm" variant="outline" onClick={() => setAddingItem(true)}>
              + Tambah Item
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
