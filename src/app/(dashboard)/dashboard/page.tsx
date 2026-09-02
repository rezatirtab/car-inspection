import Link from "next/link";
import { getSession } from "@/lib/auth/guards";
import { listInspections } from "@/services/inspections/getInspection";
import { StatCard } from "@/components/dashboard/StatCard";
import { InspectionTable, type InspectionRow } from "@/components/dashboard/InspectionTable";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const isInspector = session.role === "INSPECTOR";
  const inspections = await listInspections({
    inspectorId: isInspector ? session.userId : undefined,
    take: 10,
  });

  const rows: InspectionRow[] = inspections.map((i) => ({
    id: i.id,
    inspectionNumber: i.inspectionNumber,
    vehicleLabel: `${i.vehicle.brand} ${i.vehicle.model}`,
    clientName: i.client.name,
    inspectorName: i.inspector.name,
    status: i.status,
    createdAt: i.createdAt.toISOString(),
  }));

  const counts = {
    today: inspections.length,
    inProgress: inspections.filter((i) => i.status === "IN_PROGRESS").length,
    completed: inspections.filter((i) => i.status === "COMPLETED").length,
    draft: inspections.filter((i) => i.status === "DRAFT").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isInspector ? `Hi, ${session.name} 👋` : "Admin Dashboard"}
          </h1>
          <p className="text-sm text-slate-500">
            {isInspector ? "Siap untuk inspeksi hari ini" : "Monitor & kelola seluruh inspeksi"}
          </p>
        </div>
        {isInspector && (
          <Link href="/inspections/new">
            <Button>+ Inspeksi Baru</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Inspeksi" value={counts.today} />
        <StatCard label="Sedang Berjalan" value={counts.inProgress} tone="yellow" />
        <StatCard label="Selesai" value={counts.completed} tone="green" />
        <StatCard label="Draft" value={counts.draft} tone="blue" />
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Inspeksi Terbaru</CardTitle>
          <Link href="/inspections" className="text-sm font-medium text-blue-900 hover:underline">
            Lihat Semua
          </Link>
        </CardHeader>
        <CardBody>
          <InspectionTable rows={rows} />
        </CardBody>
      </Card>
    </div>
  );
}
