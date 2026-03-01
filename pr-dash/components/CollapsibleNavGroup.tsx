"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

export interface CollapsibleNavChild {
  id: string;
  icon: React.ElementType;
  label: string;
  href: string;
}

interface CollapsibleNavGroupProps {
  id: string;
  icon: React.ElementType;
  label: string;
  href: string;
  items: CollapsibleNavChild[];
  expanded?: boolean;
  onToggle?: (id: string) => void;
  onNavClick?: () => void;
}

export function CollapsibleNavGroup({
  id,
  icon: Icon,
  label,
  href,
  items,
  expanded,
  onToggle,
  onNavClick,
}: CollapsibleNavGroupProps) {
  const pathname = usePathname();
  const list = Array.isArray(items) ? items : [];
  const isGroupActive = list.some((c) => pathname === c.href || pathname.startsWith(`${c.href}/`));
  const isExpanded = expanded ?? isGroupActive;

  const handleToggle = () => onToggle?.(id);

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isExpanded}
        aria-controls={`nav-group-${id}`}
        id={`nav-group-trigger-${id}`}
        className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isGroupActive
            ? "bg-[var(--primary)]/10 text-[var(--primary)]"
            : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
        }`}
      >
        {isGroupActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-r-full bg-[var(--primary)]" />
        )}
        <Icon
          className={`h-[18px] w-[18px] flex-shrink-0 ${
            isGroupActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]"
          }`}
        />
        <span className="flex-1 truncate text-left">{label}</span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      <div
        id={`nav-group-${id}`}
        role="region"
        aria-labelledby={`nav-group-trigger-${id}`}
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-0.5 pl-2 border-l-2 border-[var(--border)] ml-4 pt-0.5">
          {list.map((child) => {
            const ChildIcon = child.icon;
            const childActive = pathname === child.href || pathname.startsWith(`${child.href}/`);
            return (
              <Link
                key={child.id}
                href={child.href}
                onClick={onNavClick}
                className={`group flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                  childActive
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <ChildIcon className="h-[14px] w-[14px] flex-shrink-0" />
                <span className="truncate">{child.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
