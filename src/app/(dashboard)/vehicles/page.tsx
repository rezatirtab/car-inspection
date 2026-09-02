import { listVehicles } from "@/services/vehicles/vehicleService";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";

export default async function VehiclesPage() {
  const vehicles = await listVehicles();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Data Kendaraan</h1>
      <Card>
        <CardHeader>
          <CardTitle>Semua Kendaraan ({vehicles.length})</CardTitle>
        </CardHeader>
        <CardBody>
          {vehicles.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Belum ada data kendaraan.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-2 pr-4 font-medium">No. Polisi</th>
                  <th className="py-2 pr-4 font-medium">Merk / Model</th>
                  <th className="py-2 pr-4 font-medium">Tahun</th>
                  <th className="py-2 pr-4 font-medium">KM</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 font-medium text-slate-900">{v.plateNumber}</td>
                    <td className="py-3 pr-4 text-slate-600">
                      {v.brand} {v.model}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{v.manufactureYear ?? "-"}</td>
                    <td className="py-3 pr-4 text-slate-600">
                      {v.mileage ? v.mileage.toLocaleString("id-ID") : "-"}
                    </td>
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
