import Link from "next/link";
import { getSession } from "@/lib/auth/guards";
import { listInspections } from "@/services/inspections/getInspection";
import { InspectionTable, type InspectionRow } from "@/components/dashboard/InspectionTable";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default async function InspectionsPage() {
  const session = await getSession();
  if (!session) return null;

  const isInspector = session.role === "INSPECTOR";
  const inspections = await listInspections({
    inspectorId: isInspector ? session.userId : undefined,
    take: 100,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Daftar Inspeksi</h1>
        {isInspector && (
          <Link href="/inspections/new">
            <Button>+ Inspeksi Baru</Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semua Inspeksi ({rows.length})</CardTitle>
        </CardHeader>
        <CardBody>
          <InspectionTable rows={rows} />
        </CardBody>
      </Card>
    </div>
  );
}
