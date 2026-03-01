"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

const ROUTES: Record<string, string> = {
  "/": "Dashboard",
  "/properties": "My Properties",
  "/applications": "Applications",
  "/tenants": "Tenants",
  "/staff": "Staff",
  "/maintenance": "Maintenance",
  "/finance": "Finance",
  "/reports": "Reports",
};

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();

  const title = Object.entries(ROUTES).find(([path]) => pathname === path || (path !== "/" && pathname.startsWith(path)))?.[1] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
        <h1 className="text-lg font-semibold tracking-tight text-[var(--foreground)] flex-1">{title}</h1>
      </div>
    </header>
  );
}
