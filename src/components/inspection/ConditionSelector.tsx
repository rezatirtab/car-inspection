"use client";

import { clsx } from "@/lib/utils/clsx";

type ConditionValue = "GOOD" | "ATTENTION" | "PROBLEM" | "NA";

const OPTIONS: Array<{
  value: ConditionValue;
  icon: string;
  label: string;
  activeClass: string;
}> = [
  { value: "GOOD", icon: "🟢", label: "Baik", activeClass: "border-green-600 bg-green-50 text-green-800" },
  { value: "ATTENTION", icon: "🟡", label: "Perhatian", activeClass: "border-amber-500 bg-amber-50 text-amber-800" },
  { value: "PROBLEM", icon: "🔴", label: "Bermasalah", activeClass: "border-red-600 bg-red-50 text-red-800" },
  { value: "NA", icon: "⚪", label: "N/A", activeClass: "border-slate-400 bg-slate-50 text-slate-700" },
];

/**
 * Sesuai prinsip mobile: 4 tombol harus cukup besar untuk disentuh dengan
 * nyaman satu tangan (lihat file4 bagian 6.11 Condition Component).
 */
export function ConditionSelector({
  value,
  onChange,
  disabled,
}: {
  value: ConditionValue | null;
  onChange: (value: ConditionValue) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          className={clsx(
            "flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border-2 px-2 py-3 text-sm font-semibold transition-colors disabled:opacity-50",
            value === opt.value ? opt.activeClass : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          )}
        >
          <span className="text-xl leading-none">{opt.icon}</span>
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
