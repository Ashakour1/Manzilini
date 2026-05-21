"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  MapPin,
  Pencil,
  Trash2,
  Eye,
  Search,
  BedDouble,
  Bath,
  Maximize,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Property } from "@/lib/types";
import { getProperties, deleteProperty } from "@/lib/services/property.service";
import { useLoad } from "@/lib/hooks/useLoad";

function fmtPrice(price?: number, currency?: string) {
  if (!price) return null;
  const symbol =
    currency === "USD"
      ? "$"
      : currency === "EUR"
      ? "€"
      : currency === "GBP"
      ? "£"
      : currency === "KES"
      ? "KSh "
      : currency
      ? `${currency} `
      : "";
  return `${symbol}${price.toLocaleString()}`;
}

function CardSkeleton() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden bg-[var(--card)]">
      <div className="h-48 w-full bg-[var(--muted)] animate-pulse" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 w-2/3 rounded bg-[var(--muted)] animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-[var(--muted)] animate-pulse" />
        <div className="h-3 w-1/3 rounded bg-[var(--muted)] animate-pulse" />
        <div className="flex justify-between pt-3 border-t border-[var(--border)]">
          <div className="h-3 w-20 rounded bg-[var(--muted)] animate-pulse" />
          <div className="h-6 w-20 rounded bg-[var(--muted)] animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProperties();
      setProperties(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useLoad(load);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProperty(deleteId);
      setDeleteId(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const stats = useMemo(() => {
    const total = properties.length;
    const active = properties.filter((p) => !!p.is_published).length;
    const inactive = total - active;
    const tenants = properties.reduce((s, p) => s + (p._count?.tenants ?? 0), 0);
    return { total, active, inactive, tenants };
  }, [properties]);

  const filteredProperties = useMemo(() => {
    const q = search.trim().toLowerCase();
    return properties.filter((p) => {
      if (statusFilter === "active" && !p.is_published) return false;
      if (statusFilter === "inactive" && p.is_published) return false;
      if (!q) return true;
      const haystack = [p.title, p.address, p.city, p.country, p.property_type]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [properties, search, statusFilter]);

  const hasResults = filteredProperties.length > 0;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--primary)] bg-[var(--primary)]/10 rounded-full px-2.5 py-1 mb-3">
            <Sparkles className="h-3 w-3" aria-hidden />
            Portfolio
          </span>
          <h1 className="text-[26px] sm:text-[28px] font-semibold tracking-tight text-[var(--foreground)] leading-tight">
            My Properties
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Manage listings, availability, and tenants in one place.
          </p>
        </div>
        <Link
          href="/properties/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium h-10 px-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white shadow-sm shadow-[var(--primary)]/20 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add property
        </Link>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-sky-600" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Total</p>
            <p className="text-lg font-semibold text-[var(--foreground)] tabular-nums">
              {loading ? "—" : stats.total}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:border-l sm:border-[var(--border)] sm:pl-4">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Active</p>
            <p className="text-lg font-semibold text-emerald-600 tabular-nums">
              {loading ? "—" : stats.active}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:border-l sm:border-[var(--border)] sm:pl-4">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Inactive</p>
            <p className="text-lg font-semibold text-[var(--foreground)] tabular-nums">
              {loading ? "—" : stats.inactive}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:border-l sm:border-[var(--border)] sm:pl-4">
          <BedDouble className="h-5 w-5 text-amber-600" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Tenants</p>
            <p className="text-lg font-semibold text-[var(--foreground)] tabular-nums">
              {loading ? "—" : stats.tenants}
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          {error}
          <button onClick={() => setError("")} className="font-medium hover:opacity-80" aria-label="Dismiss">&times;</button>
        </div>
      )}

      {deleteId && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-red-700">Delete this property? This cannot be undone.</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      )}

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] pointer-events-none" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, city, country, or type…"
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-[var(--border)] bg-white text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/80 text-sm shadow-sm transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 focus:outline-none"
          />
        </div>
        <div className="inline-flex rounded-lg border border-[var(--border)] bg-white p-0.5 shadow-sm self-start sm:self-auto">
          {(
            [
              { id: "all", label: `All${stats.total ? ` · ${stats.total}` : ""}` },
              { id: "active", label: `Active${stats.active ? ` · ${stats.active}` : ""}` },
              { id: "inactive", label: `Inactive${stats.inactive ? ` · ${stats.inactive}` : ""}` },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setStatusFilter(opt.id)}
              className={`h-9 px-3 rounded-md text-xs font-medium transition-colors ${
                statusFilter === opt.id
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--card)] py-16 px-6 text-center">
          <Building2 className="h-12 w-12 mx-auto text-[var(--muted-foreground)] opacity-50 mb-4" />
          <p className="text-base font-semibold text-[var(--foreground)] mb-1">No properties yet</p>
          <p className="text-sm text-[var(--muted-foreground)] mb-5 max-w-sm mx-auto">
            Add your first property to start managing listings, tenants and finances.
          </p>
          <Link
            href="/properties/new"
            className="inline-flex items-center gap-2 rounded-lg text-sm font-medium h-10 px-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white shadow-sm shadow-[var(--primary)]/20 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add your first property
          </Link>
        </div>
      ) : !hasResults ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--card)] py-16 px-6 text-center">
          <Search className="h-10 w-10 mx-auto text-[var(--muted-foreground)] opacity-50 mb-4" />
          <p className="text-base font-semibold text-[var(--foreground)] mb-1">No matches</p>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Try a different search term or clear the filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
          >
            Reset filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((p) => {
            const firstImage = p.images?.[0]?.url;
            const price = fmtPrice(p.price, p.currency);
            const freq = p.payment_frequency?.toLowerCase();
            const location = [p.city, p.country].filter(Boolean).join(", ");
            const propertyType = p.property_type?.toLowerCase().replace(/_/g, " ");
            return (
              <div
                key={p.id}
                className="group rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden bg-[var(--card)] hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--primary)]/30 transition-all"
              >
                <Link href={`/properties/${p.id}`} className="block">
                  <div className="relative h-48 w-full bg-[var(--muted)] overflow-hidden">
                    {firstImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={firstImage}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-[var(--muted)] to-[var(--background)]">
                        <ImageIcon className="h-10 w-10 text-[var(--muted-foreground)]/40" />
                        <p className="mt-2 text-xs text-[var(--muted-foreground)]/70">No photo</p>
                      </div>
                    )}

                    <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm ${
                          p.is_published
                            ? "bg-emerald-500/15 text-emerald-100 ring-1 ring-emerald-300/30"
                            : "bg-black/40 text-white ring-1 ring-white/20"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            p.is_published ? "bg-emerald-300" : "bg-slate-300"
                          }`}
                        />
                        {p.is_published ? "Active" : "Inactive"}
                      </span>
                      {p.images && p.images.length > 1 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-sm px-2 py-1 text-[10px] text-white ring-1 ring-white/15">
                          <ImageIcon className="h-3 w-3" />
                          {p.images.length}
                        </span>
                      )}
                    </div>

                    {price && (
                      <div className="absolute left-3 bottom-3 inline-flex items-baseline gap-1 rounded-lg bg-white/95 backdrop-blur-sm px-2.5 py-1.5 shadow-sm ring-1 ring-black/5">
                        <span className="text-sm font-semibold text-[var(--foreground)]">{price}</span>
                        {freq && (
                          <span className="text-[10px] text-[var(--muted-foreground)]">/ {freq}</span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4 space-y-3">
                  <div>
                    <Link href={`/properties/${p.id}`}>
                      <h3 className="text-[15px] font-semibold text-[var(--foreground)] line-clamp-1 hover:text-[var(--primary)] transition-colors">
                        {p.title}
                      </h3>
                    </Link>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="line-clamp-1">{location || p.address || "—"}</span>
                    </div>
                  </div>

                  {/* Specs */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--muted-foreground)]">
                    {propertyType && (
                      <span className="inline-flex items-center gap-1 capitalize text-[var(--foreground)] font-medium">
                        {propertyType}
                      </span>
                    )}
                    {p.bedrooms != null && (
                      <span className="inline-flex items-center gap-1">
                        <BedDouble className="h-3.5 w-3.5" />
                        {p.bedrooms} {p.bedrooms === 1 ? "bed" : "beds"}
                      </span>
                    )}
                    {p.bathrooms != null && (
                      <span className="inline-flex items-center gap-1">
                        <Bath className="h-3.5 w-3.5" />
                        {p.bathrooms} {p.bathrooms === 1 ? "bath" : "baths"}
                      </span>
                    )}
                    {p.size != null && (
                      <span className="inline-flex items-center gap-1">
                        <Maximize className="h-3.5 w-3.5" />
                        {p.size} m²
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {p._count?.tenants ?? 0} {(p._count?.tenants ?? 0) === 1 ? "tenant" : "tenants"}
                      {(p._count?.property_applications ?? 0) > 0 && (
                        <span className="ml-1">· {p._count?.property_applications} app{p._count?.property_applications === 1 ? "" : "s"}</span>
                      )}
                    </span>
                    <div className="flex gap-0.5">
                      <Link
                        href={`/properties/${p.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)] transition-colors"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/properties/${p.id}/edit`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)] transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteId(p.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
