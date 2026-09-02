import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/guards";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SopManager } from "@/components/sop/SopManager";

export default async function SopPage() {
  const session = await getSession();
  const sections = await prisma.inspectionSection.findMany({
    orderBy: { displayOrder: "asc" },
    include: { items: { orderBy: { displayOrder: "asc" } } },
  });

  const isAdmin = session?.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Master SOP Checklist</h1>
        <p className="text-sm text-slate-500">
          {isAdmin
            ? "Kelola section & item checklist yang dipakai untuk inspeksi baru. Perubahan tidak mengubah inspeksi yang sudah berjalan (memakai snapshot SOP saat inspeksi dibuat)."
            : "Daftar item inspeksi yang berlaku saat ini."}
        </p>
      </div>

      {isAdmin ? (
        <SopManager sections={JSON.parse(JSON.stringify(sections))} />
      ) : (
        sections.map((section) => (
          <Card key={section.id}>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>
                {section.name} <span className="font-mono text-xs text-slate-400">({section.code})</span>
              </CardTitle>
              <Badge tone={section.isActive ? "green" : "gray"}>
                {section.isActive ? "Aktif" : "Nonaktif"}
              </Badge>
            </CardHeader>
            <CardBody>
              <ul className="divide-y divide-slate-100">
                {section.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-slate-700">{item.name}</span>
                    <span className="font-mono text-xs text-slate-400">{item.inputType}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        ))
      )}
    </div>
  );
}
