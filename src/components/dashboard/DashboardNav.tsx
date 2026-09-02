"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "@/lib/utils/clsx";
import { USER_ROLE_LABEL } from "@/config/constants";

const NAV_ITEMS: Array<{ href: string; label: string; adminOnly?: boolean }> = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/inspections", label: "Inspeksi" },
  { href: "/review", label: "Review", adminOnly: true },
  { href: "/reports", label: "Report" },
  { href: "/clients", label: "Client" },
  { href: "/vehicles", label: "Kendaraan" },
  { href: "/sop", label: "Master SOP" },
];

export function DashboardNav({
  userName,
  userRole,
}: {
  userName: string;
  userRole: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || userRole === "ADMIN");

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="font-bold text-blue-900">Vehicle Inspection</span>
          <nav className="hidden gap-1 sm:flex">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  pathname?.startsWith(item.href)
                    ? "bg-blue-50 text-blue-900"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium leading-tight text-slate-900">{userName}</p>
            <p className="text-xs leading-tight text-slate-400">
              {USER_ROLE_LABEL[userRole] ?? userRole}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md px-2.5 py-1.5 text-sm text-slate-500 hover:bg-slate-100"
          >
            Keluar
          </button>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-1.5 sm:hidden">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium",
              pathname?.startsWith(item.href) ? "bg-blue-50 text-blue-900" : "text-slate-600"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
