import { InspectionStatusBadge } from "@/components/ui/Badge";

export function InspectionHeader({
  inspectionNumber,
  vehicleLabel,
  plateNumber,
  status,
}: {
  inspectionNumber: string;
  vehicleLabel: string;
  plateNumber: string;
  status: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3">
      <div>
        <p className="text-xs text-slate-400">{inspectionNumber}</p>
        <p className="font-semibold text-slate-900">
          {vehicleLabel} · {plateNumber}
        </p>
      </div>
      <InspectionStatusBadge status={status} />
    </div>
  );
}
