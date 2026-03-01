"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Building2, Plus, MapPin, Pencil, Trash2, FileText, Home, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Property } from "@/lib/types";
import { getProperties, deleteProperty } from "@/lib/services/property.service";
import { useLoad } from "@/lib/hooks/useLoad";

function getStatusStyle(published: boolean) {
  return published ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600";
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  const hasProperties = properties.length > 0;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">My Properties</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage your rental properties</p>
        </div>
        <Link
          href="/properties/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium h-9 px-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Property
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          {error}
          <button onClick={() => setError("")} className="font-medium hover:opacity-80">&times;</button>
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

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Properties</CardTitle>
          <CardDescription>
            {hasProperties ? `${properties.length} property listings` : "Your property listings will appear here"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="py-8 text-center text-gray-400 text-sm">Loading your properties...</div>
          )}
          {!loading && !hasProperties && (
            <div className="text-center py-16">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--muted)] mb-4">
                <Building2 className="h-7 w-7 text-[var(--muted-foreground)]" />
              </div>
              <p className="text-sm font-medium text-[var(--foreground)] mb-1">No properties yet</p>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">Click Add Property to create your first one</p>
              <Link href="/properties/new" className="inline-flex items-center gap-2 rounded-lg text-sm font-medium h-9 px-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white">
                <Plus className="h-4 w-4" />
                Add Property
              </Link>
            </div>
          )}
          {!loading && hasProperties && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((p) => {
                const firstImage = p.images?.[0]?.url;
                return (
                  <div
                    key={p.id}
                    className="group rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden bg-[var(--card)] hover:border-[var(--primary)]/30 transition-colors"
                  >
                    <div className="relative h-44 w-full bg-[var(--muted)] overflow-hidden">
                      {firstImage ? (
                        <img src={firstImage} alt={p.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-[var(--muted)]">
                          <Building2 className="h-12 w-12 text-[var(--muted-foreground)]" />
                        </div>
                      )}
                      <span className={`absolute top-2 right-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(!!p.is_published)}`}>
                        {p.is_published ? "Active" : "Inactive"}
                      </span>
                      {p.images && p.images.length > 1 && (
                        <span className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-0.5 text-[10px] text-white">
                          +{p.images.length - 1} more
                        </span>
                      )}
                    </div>
                    <div className="p-4 space-y-2.5">
                      <h3 className="text-sm font-semibold text-[var(--foreground)] line-clamp-1">{p.title}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                        <Home className="h-3.5 w-3.5 flex-shrink-0 opacity-70" />
                        <span className="capitalize">{p.property_type?.toLowerCase().replace("_", " ") || "—"}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-xs text-[var(--muted-foreground)]">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 opacity-70" />
                        <span className="line-clamp-2">
                          {[p.address, p.city, p.country].filter(Boolean).join(", ") || "—"}
                        </span>
                      </div>
                      {p.description && (
                        <div className="flex items-start gap-1.5 text-xs text-[var(--muted-foreground)]">
                          <FileText className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 opacity-70" />
                          <p className="line-clamp-2 flex-1">{p.description}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {p._count?.tenants ?? 0} tenant(s)
                          {(p._count?.property_applications ?? 0) > 0 && (
                            <span className="ml-1">&bull; {p._count?.property_applications ?? 0} application(s)</span>
                          )}
                        </span>
                        <div className="flex gap-0.5">
                          <Link href={`/properties/${p.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors" title="View details">
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link href={`/properties/${p.id}/edit`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors" title="Edit">
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
        </CardContent>
      </Card>
    </div>
  );
}
