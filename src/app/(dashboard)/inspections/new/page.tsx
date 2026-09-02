"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label, Input } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";

/**
 * Alur sederhana V1: isi data client & kendaraan langsung di form yang sama
 * (create-if-not-exists di server), sesuai langkah "01 Create Inspection"
 * & "02 Input Vehicle & Client" pada Inspection Workflow.
 */
export default function NewInspectionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [manufactureYear, setManufactureYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [location, setLocation] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const clientRes = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: clientName, phone: clientPhone || undefined }),
      });
      const clientJson = await clientRes.json();
      if (!clientJson.success) throw new Error(clientJson.error?.message ?? "Gagal menyimpan client.");

      const vehicleRes = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plateNumber,
          brand,
          model,
          manufactureYear: manufactureYear ? Number(manufactureYear) : undefined,
          mileage: mileage ? Number(mileage) : undefined,
        }),
      });
      const vehicleJson = await vehicleRes.json();
      if (!vehicleJson.success) throw new Error(vehicleJson.error?.message ?? "Gagal menyimpan kendaraan.");

      const inspectionRes = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientJson.data.client.id,
          vehicleId: vehicleJson.data.vehicle.id,
          inspectionLocation: location || undefined,
        }),
      });
      const inspectionJson = await inspectionRes.json();
      if (!inspectionJson.success) throw new Error(inspectionJson.error?.message ?? "Gagal membuat inspeksi.");

      router.push(`/inspections/${inspectionJson.data.inspection.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Inspeksi Baru</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Client</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <Label required>Nama Client</Label>
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} required />
            </div>
            <div>
              <Label>No. Telepon</Label>
              <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Kendaraan</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <Label required>Nomor Polisi</Label>
              <Input
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label required>Merk</Label>
                <Input value={brand} onChange={(e) => setBrand(e.target.value)} required />
              </div>
              <div>
                <Label required>Model</Label>
                <Input value={model} onChange={(e) => setModel(e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tahun</Label>
                <Input
                  type="number"
                  value={manufactureYear}
                  onChange={(e) => setManufactureYear(e.target.value)}
                />
              </div>
              <div>
                <Label>Kilometer</Label>
                <Input type="number" value={mileage} onChange={(e) => setMileage(e.target.value)} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lokasi Inspeksi</CardTitle>
          </CardHeader>
          <CardBody>
            <Input
              placeholder="Contoh: Jakarta Selatan"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </CardBody>
        </Card>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Memproses..." : "Mulai Inspeksi"}
        </Button>
      </form>
    </div>
  );
}
