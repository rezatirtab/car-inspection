import { getSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { REPORT_TYPE_LABEL } from "@/config/constants";
import Link from "next/link";

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) return null;

  const reports = await prisma.inspectionReport.findMany({
    where:
      session.role === "INSPECTOR"
        ? { inspection: { inspectorId: session.userId } }
        : undefined,
    orderBy: { generatedAt: "desc" },
    take: 50,
    include: { inspection: { include: { vehicle: true, client: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Report</h1>
      <Card>
        <CardHeader>
          <CardTitle>Report Terbaru</CardTitle>
        </CardHeader>
        <CardBody>
          {reports.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Belum ada report dibuat.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {reports.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <Link
                      href={`/inspections/${r.inspectionId}`}
                      className="font-medium text-blue-900 hover:underline"
                    >
                      {r.inspection.inspectionNumber}
                    </Link>
                    <p className="text-slate-500">
                      {r.inspection.vehicle.brand} {r.inspection.vehicle.model} ·{" "}
                      {r.inspection.client.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-700">
                      {REPORT_TYPE_LABEL[r.reportType]} (v{r.version})
                    </p>
                    <a
                      href={`/api/uploads/${encodeURIComponent(r.fileKey)}`}
                      download={r.fileName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-900 hover:underline"
                    >
                      Unduh
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
