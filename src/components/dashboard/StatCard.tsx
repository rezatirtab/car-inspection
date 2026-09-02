import { Card, CardBody } from "@/components/ui/Card";
import { clsx } from "@/lib/utils/clsx";

export function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "green" | "yellow" | "blue";
}) {
  const toneClass = {
    default: "text-slate-900",
    green: "text-green-700",
    yellow: "text-amber-700",
    blue: "text-blue-800",
  }[tone];

  return (
    <Card>
      <CardBody className="py-4">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className={clsx("mt-1 text-2xl font-bold", toneClass)}>{value}</p>
      </CardBody>
    </Card>
  );
}
