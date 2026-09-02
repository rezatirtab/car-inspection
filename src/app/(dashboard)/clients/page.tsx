import { listClients } from "@/services/clients/clientService";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";

export default async function ClientsPage() {
  const clients = await listClients();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Data Client</h1>
      <Card>
        <CardHeader>
          <CardTitle>Semua Client ({clients.length})</CardTitle>
        </CardHeader>
        <CardBody>
          {clients.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Belum ada data client.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-2 pr-4 font-medium">Nama</th>
                  <th className="py-2 pr-4 font-medium">Telepon</th>
                  <th className="py-2 pr-4 font-medium">Email</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 font-medium text-slate-900">{c.name}</td>
                    <td className="py-3 pr-4 text-slate-600">{c.phone ?? "-"}</td>
                    <td className="py-3 pr-4 text-slate-600">{c.email ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
