import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/guards";
import { getInspectionDetail } from "@/services/inspections/getInspection";
import { InspectionWorkspace } from "./InspectionWorkspace";

export default async function InspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return null;

  const inspection = await getInspectionDetail(id);
  if (!inspection) notFound();

  // Inspector hanya boleh melihat inspeksinya sendiri.
  if (session.role === "INSPECTOR" && inspection.inspectorId !== session.userId) {
    notFound();
  }

  return <InspectionWorkspace inspection={JSON.parse(JSON.stringify(inspection))} canEdit={session.role === "ADMIN" || inspection.status !== "COMPLETED"} />;
}
