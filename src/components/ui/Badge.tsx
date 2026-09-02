import { clsx } from "@/lib/utils/clsx";

type BadgeTone = "green" | "yellow" | "red" | "gray" | "blue";

const TONE_CLASS: Record<BadgeTone, string> = {
  green: "bg-green-100 text-green-800",
  yellow: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-800",
  gray: "bg-slate-100 text-slate-700",
  blue: "bg-blue-100 text-blue-800",
};

export function Badge({
  children,
  tone = "gray",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        TONE_CLASS[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Badge khusus status inspeksi, otomatis memetakan warna & label Indonesia. */
export function InspectionStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; tone: BadgeTone }> = {
    DRAFT: { label: "Draft", tone: "gray" },
    IN_PROGRESS: { label: "Sedang Berjalan", tone: "yellow" },
    COMPLETED: { label: "Selesai", tone: "green" },
    REVIEWED: { label: "Sudah Direview", tone: "blue" },
    CANCELLED: { label: "Dibatalkan", tone: "red" },
  };
  const entry = map[status] ?? { label: status, tone: "gray" as BadgeTone };
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}
