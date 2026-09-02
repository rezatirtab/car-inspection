"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { InspectionHeader } from "@/components/inspection/InspectionHeader";
import { SectionSelector } from "@/components/inspection/SectionSelector";
import { InspectionProgress } from "@/components/inspection/InspectionProgress";
import { InspectionItem, type InspectionItemData, type ItemFindingData } from "@/components/inspection/InspectionItem";
import { FindingForm, type FindingFormValue } from "@/components/inspection/FindingForm";
import { FinalAssessmentForm, type FinalAssessmentValue } from "@/components/inspection/FinalAssessment";
import type { PhotoData } from "@/components/inspection/PhotoUploader";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { REPORT_TYPE_LABEL } from "@/config/constants";

// Tipe longgar (any-ish) karena data berasal dari JSON.parse(JSON.stringify(prisma result)).
type RawInspection = {
  id: string;
  inspectionNumber: string;
  status: string;
  vehicle: { brand: string; model: string; plateNumber: string };
  finalAssessment: FinalAssessmentValue | null;
  sectionSnapshots: Array<{
    id: string;
    name: string;
    displayOrder: number;
    items: Array<{
      id: string;
      code: string;
      name: string;
      inputType: InspectionItemData["inputType"];
      allowsNotes: boolean;
      allowsPhoto: boolean;
      result: {
        id: string;
        condition: "GOOD" | "ATTENTION" | "PROBLEM" | "NA";
        notes: string | null;
        technicalValue: string | null;
        photos: PhotoData[];
        findings: ItemFindingData[];
      } | null;
    }>;
  }>;
};

export function InspectionWorkspace({
  inspection,
  canEdit,
}: {
  inspection: RawInspection;
  canEdit: boolean;
}) {
  const router = useRouter();
  const sortedSections = useMemo(
    () => [...inspection.sectionSnapshots].sort((a, b) => a.displayOrder - b.displayOrder),
    [inspection.sectionSnapshots]
  );

  const [activeSectionId, setActiveSectionId] = useState(sortedSections[0]?.id ?? "");
  const [findingForItemId, setFindingForItemId] = useState<string | null>(null);
  const [view, setView] = useState<"checklist" | "final">("checklist");
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string[] | null>(null);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  const activeSection = sortedSections.find((s) => s.id === activeSectionId) ?? sortedSections[0];

  const sectionTabs = sortedSections.map((s) => ({
    id: s.id,
    name: s.name,
    completed: s.items.filter((i) => i.result).length,
    total: s.items.length,
  }));

  const totalCompleted = sectionTabs.reduce((sum, s) => sum + s.completed, 0);
  const totalItems = sectionTabs.reduce((sum, s) => sum + s.total, 0);

  async function saveItemResult(
    itemSnapshotId: string,
    payload: { condition: "GOOD" | "ATTENTION" | "PROBLEM" | "NA"; notes?: string; technicalValue?: string }
  ) {
    const res = await fetch(`/api/inspections/${inspection.id}/items/${itemSnapshotId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message ?? "Gagal menyimpan.");
    router.refresh();
  }

  async function submitFinding(resultId: string, value: FindingFormValue) {
    const res = await fetch(`/api/inspections/${inspection.id}/findings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...value, resultId }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message ?? "Gagal menyimpan finding.");
    setFindingForItemId(null);
    router.refresh();
  }

  async function deleteFinding(findingId: string) {
    const res = await fetch(`/api/findings/${findingId}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) {
      alert(json.error?.message ?? "Gagal menghapus finding.");
      return;
    }
    router.refresh();
  }

  async function submitFinalAssessment(value: FinalAssessmentValue) {
    const res = await fetch(`/api/inspections/${inspection.id}/final-assessment`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message ?? "Gagal menyimpan.");
    router.refresh();
  }

  async function handleComplete() {
    setCompleting(true);
    setCompleteError(null);
    try {
      const res = await fetch(`/api/inspections/${inspection.id}/complete`, { method: "POST" });
      const json = await res.json();
      if (!json.success) {
        setCompleteError(
          json.error?.details?.length ? json.error.details : [json.error?.message ?? "Gagal menyelesaikan inspeksi."]
        );
        return;
      }
      router.refresh();
    } finally {
      setCompleting(false);
    }
  }

  async function handleGenerateReport(type: "CLIENT_SUMMARY" | "DETAILED_REPORT" | "FULL_REPORT") {
    setGeneratingReport(type);
    try {
      const res = await fetch(`/api/inspections/${inspection.id}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const json = await res.json();
      if (!json.success) {
        alert(json.error?.message ?? "Gagal membuat report.");
      } else {
        router.refresh();
      }
    } finally {
      setGeneratingReport(null);
    }
  }

  const isCompleted = inspection.status === "COMPLETED" || inspection.status === "REVIEWED";

  return (
    <div className="space-y-4">
      <InspectionHeader
        inspectionNumber={inspection.inspectionNumber}
        vehicleLabel={`${inspection.vehicle.brand} ${inspection.vehicle.model}`}
        plateNumber={inspection.vehicle.plateNumber}
        status={inspection.status}
      />

      <div className="flex items-center justify-between">
        <InspectionProgress completed={totalCompleted} total={totalItems} />
        <div className="flex gap-2">
          <Button
            variant={view === "checklist" ? "primary" : "outline"}
            size="sm"
            onClick={() => setView("checklist")}
          >
            Checklist
          </Button>
          <Button variant={view === "final" ? "primary" : "outline"} size="sm" onClick={() => setView("final")}>
            Final Assessment
          </Button>
        </div>
      </div>

      {view === "checklist" && (
        <>
          <SectionSelector sections={sectionTabs} activeId={activeSection?.id ?? ""} onSelect={setActiveSectionId} />

          <div className="space-y-3">
            {activeSection?.items.map((item) => (
              <div key={item.id}>
                <InspectionItem
                  inspectionId={inspection.id}
                  canEdit={canEdit}
                  item={{
                    itemSnapshotId: item.id,
                    resultId: item.result?.id ?? null,
                    code: item.code,
                    name: item.name,
                    inputType: item.inputType,
                    allowsNotes: item.allowsNotes,
                    allowsPhoto: item.allowsPhoto,
                    condition: item.result?.condition ?? null,
                    notes: item.result?.notes ?? null,
                    technicalValue: item.result?.technicalValue ?? null,
                    photos: item.result?.photos ?? [],
                    findings: item.result?.findings ?? [],
                  }}
                  onSave={(payload) => saveItemResult(item.id, payload)}
                  onAddFinding={canEdit ? () => setFindingForItemId(item.id) : undefined}
                  onDeleteFinding={canEdit ? deleteFinding : undefined}
                />
                {findingForItemId === item.id && item.result && (
                  <div className="mt-2">
                    <FindingForm
                      initialSeverity="PROBLEM"
                      onSubmit={(value) => submitFinding(item.result!.id, value)}
                      onCancel={() => setFindingForItemId(null)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {view === "final" && (
        <div className="space-y-4">
          <FinalAssessmentForm initialValue={inspection.finalAssessment ?? undefined} onSubmit={submitFinalAssessment} />

          {!isCompleted && canEdit && (
            <Card>
              <CardBody className="space-y-3">
                {completeError && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    <p className="mb-1 font-medium">Inspeksi belum dapat diselesaikan:</p>
                    <ul className="list-inside list-disc">
                      {completeError.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <Button className="w-full" onClick={handleComplete} disabled={completing}>
                  {completing ? "Memproses..." : "Selesaikan Inspeksi"}
                </Button>
              </CardBody>
            </Card>
          )}

          {isCompleted && (
            <Card>
              <CardHeader>
                <CardTitle>Generate Report</CardTitle>
              </CardHeader>
              <CardBody className="flex flex-wrap gap-2">
                {(["CLIENT_SUMMARY", "DETAILED_REPORT", "FULL_REPORT"] as const).map((type) => (
                  <Button
                    key={type}
                    variant="outline"
                    onClick={() => handleGenerateReport(type)}
                    disabled={generatingReport === type}
                  >
                    {generatingReport === type ? "Membuat..." : REPORT_TYPE_LABEL[type]}
                  </Button>
                ))}
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
