"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/lib/store/auth.store";
import { LayoutDashboard, Building2, ClipboardList, DollarSign, Users, UserCog, LogOut, BarChart3, ArrowDownCircle, ArrowUpCircle, FileBarChart2, Home, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollapsibleNavGroup } from "@/components/CollapsibleNavGroup";

const menuItems: Array<{
  id: string;
  icon: React.ElementType;
  label: string;
  href: string;
  children?: { id: string; icon: React.ElementType; label: string; href: string }[];
}> = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { id: "properties", icon: Building2, label: "My Properties", href: "/properties" },
  { id: "applications", icon: ClipboardList, label: "Applications", href: "/applications" },
  { id: "tenants", icon: Users, label: "Tenants", href: "/tenants" },
  { id: "staff", icon: UserCog, label: "Staff", href: "/staff" },
  { id: "maintenance", icon: Wrench, label: "Maintenance", href: "/maintenance" },
  {
    id: "finance",
    icon: DollarSign,
    label: "Finance",
    href: "/finance/report",
    children: [
      { id: "report", icon: BarChart3, label: "Report", href: "/finance/report" },
      { id: "income", icon: ArrowDownCircle, label: "Income", href: "/finance/income" },
      { id: "expense", icon: ArrowUpCircle, label: "Expense", href: "/finance/expense" },
    ],
  },
  {
    id: "reports",
    icon: FileBarChart2,
    label: "Reports",
    href: "/reports/finance",
    children: [
      { id: "finance-report", icon: BarChart3, label: "Finance", href: "/reports/finance" },
      { id: "applications-report", icon: ClipboardList, label: "Applications", href: "/reports/applications" },
      { id: "tenants-report", icon: Users, label: "Tenants", href: "/reports/tenants" },
      { id: "property-finance", icon: Home, label: "Property with Finance", href: "/reports/property-with-finance" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const handleToggleGroup = (id: string) => {
    setExpandedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const logout = useAuthStore((s) => s.logout);
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="relative hidden lg:flex h-screen w-52 flex-col overflow-hidden border-r border-[var(--border)] bg-[var(--card)]">
      {/* Brand */}
      <div className="px-5 pt-5 pb-4">
        <Link href="/" className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 rounded-md">
          <Image src="/logo.png" alt="Manzilini" width={36} height={36} className="rounded-lg" />
          <div>
            <span className="text-lg font-bold tracking-tight text-[var(--foreground)] leading-tight block">Manzilini</span>
            <span className="text-[10px] text-[var(--muted-foreground)] leading-none">Landlord Portal</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pt-2">
        {menuItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isGroupActive = hasChildren && item.children!.some((c) => pathname === c.href || pathname.startsWith(`${c.href}/`));
          const isExpanded = expandedGroups.includes(item.id) || isGroupActive;

          if (hasChildren) {
            return (
              <CollapsibleNavGroup
                key={item.id}
                id={item.id}
                icon={item.icon}
                label={item.label}
                href={item.href}
                items={item.children!}
                expanded={isExpanded}
                onToggle={handleToggleGroup}
              />
            );
          }

          const active = item.href === "/" ? pathname === "/" : (pathname === item.href || pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-r-full bg-[var(--primary)]" />
              )}
              <item.icon
                className={`h-[18px] w-[18px] flex-shrink-0 ${
                  active ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]"
                }`}
              />
              <span className="flex-1 truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-[var(--border)] px-3 py-4">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-2.5 rounded-lg px-3 py-2.5 text-sm text-[var(--muted-foreground)] hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </aside>
  );
}
