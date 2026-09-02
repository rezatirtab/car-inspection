"use client";

import { clsx } from "@/lib/utils/clsx";

export function SectionSelector({
  sections,
  activeId,
  onSelect,
}: {
  sections: Array<{ id: string; name: string; completed: number; total: number }>;
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {sections.map((s) => {
        const isDone = s.total > 0 && s.completed === s.total;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={clsx(
              "flex shrink-0 flex-col items-start rounded-lg border px-3.5 py-2 text-left transition-colors",
              activeId === s.id
                ? "border-blue-900 bg-blue-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            )}
          >
            <span className="text-sm font-medium">{s.name}</span>
            <span
              className={clsx(
                "text-xs",
                activeId === s.id ? "text-blue-100" : isDone ? "text-green-600" : "text-slate-400"
              )}
            >
              {s.completed}/{s.total} {isDone ? "✓" : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}
