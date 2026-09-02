import Link from "next/link";
import { InspectionStatusBadge } from "@/components/ui/Badge";

export type InspectionRow = {
  id: string;
  inspectionNumber: string;
  vehicleLabel: string;
  clientName: string;
  inspectorName: string;
  status: string;
  createdAt: string;
};

export function InspectionTable({ rows }: { rows: InspectionRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        Belum ada data inspeksi.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
            <th className="py-2 pr-4 font-medium">No. Inspeksi</th>
            <th className="py-2 pr-4 font-medium">Kendaraan</th>
            <th className="py-2 pr-4 font-medium">Client</th>
            <th className="py-2 pr-4 font-medium">Inspector</th>
            <th className="py-2 pr-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-slate-100 last:border-0">
              <td className="py-3 pr-4">
                <Link
                  href={`/inspections/${row.id}`}
                  className="font-medium text-blue-900 hover:underline"
                >
                  {row.inspectionNumber}
                </Link>
              </td>
              <td className="py-3 pr-4 text-slate-700">{row.vehicleLabel}</td>
              <td className="py-3 pr-4 text-slate-700">{row.clientName}</td>
              <td className="py-3 pr-4 text-slate-700">{row.inspectorName}</td>
              <td className="py-3 pr-4">
                <InspectionStatusBadge status={row.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
