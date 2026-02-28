"use client";

import { usePathname } from "next/navigation";

const ROUTES: Record<string, string> = {
  "/properties": "My Properties",
  "/applications": "Applications",
  "/tenants": "Tenants",
  "/staff": "Staff",
};

export function Header() {
  const pathname = usePathname();

  const title = Object.entries(ROUTES).find(([path]) => pathname.startsWith(path))?.[1] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-6">
        <h1 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">{title}</h1>
      </div>
    </header>
  );
}
