import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/guards";
import { listInspections } from "@/services/inspections/getInspection";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { InspectionStatusBadge } from "@/components/ui/Badge";
import { ReviewActionButton } from "@/components/dashboard/ReviewActionButton";

export default async function ReviewPage() {
  const session = await getSession();
  if (!session) return null;
  if (session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [pending, reviewed] = await Promise.all([
    listInspections({ status: "COMPLETED", take: 50 }),
    listInspections({ status: "REVIEWED", take: 20 }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Review Inspeksi</h1>
        <p className="text-sm text-slate-500">
          Inspeksi yang sudah diselesaikan Inspector, menunggu diperiksa Admin sebelum
          dianggap final.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menunggu Review ({pending.length})</CardTitle>
        </CardHeader>
        <CardBody>
          {pending.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              Tidak ada inspeksi yang menunggu review saat ini.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {pending.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <Link
                      href={`/inspections/${i.id}`}
                      className="font-medium text-blue-900 hover:underline"
                    >
                      {i.inspectionNumber}
                    </Link>
                    <p className="text-slate-500">
                      {i.vehicle.brand} {i.vehicle.model} ({i.vehicle.plateNumber}) ·{" "}
                      {i.client.name} · Inspector: {i.inspector.name}
                    </p>
                  </div>
                  <ReviewActionButton inspectionId={i.id} />
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Sudah Direview (terbaru)</CardTitle>
        </CardHeader>
        <CardBody>
          {reviewed.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Belum ada riwayat.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {reviewed.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <Link
                      href={`/inspections/${i.id}`}
                      className="font-medium text-blue-900 hover:underline"
                    >
                      {i.inspectionNumber}
                    </Link>
                    <p className="text-slate-500">
                      {i.vehicle.brand} {i.vehicle.model} · {i.client.name}
                    </p>
                  </div>
                  <InspectionStatusBadge status={i.status} />
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
