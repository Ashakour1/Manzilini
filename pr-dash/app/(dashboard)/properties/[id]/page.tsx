"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Building2,
  ArrowLeft,
  Pencil,
  Trash2,
  MapPin,
  Home,
  Bed,
  Bath,
  Car,
  Maximize,
  Sofa,
  Fence,
  Users,
  ClipboardList,
  Tag,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Layers,
  Globe,
  Banknote,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Property } from "@/lib/types";
import { getProperty, deleteProperty } from "@/lib/services/property.service";

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!id) return;
    getProperty(id)
      .then(setProperty)
      .catch(() => setError("Property not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm("Delete this property? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteProperty(id);
      router.push("/properties");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="p-6 md:p-8 space-y-4 max-w-4xl mx-auto">
        <Link href="/properties" className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to properties
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error || "Property not found"}</div>
      </div>
    );
  }

  const images = property.images ?? [];
  const hasImages = images.length > 0;
  const location = [property.address, property.city, property.country].filter(Boolean).join(", ");

  const statusLabel = property.status?.replaceAll("_", " ") || "—";
  const statusColor = (() => {
    switch (property.status) {
      case "FOR_RENT": return "bg-blue-50 text-blue-700";
      case "FOR_SALE": return "bg-violet-50 text-violet-700";
      case "RENTED": return "bg-emerald-50 text-emerald-700";
      case "SOLD": return "bg-gray-100 text-gray-600";
      default: return "bg-gray-100 text-gray-600";
    }
  })();

  const stats = [
    property.bedrooms != null ? { icon: Bed, label: "Bedrooms", value: property.bedrooms } : null,
    property.bathrooms != null ? { icon: Bath, label: "Bathrooms", value: property.bathrooms } : null,
    property.garages != null ? { icon: Car, label: "Garages", value: property.garages } : null,
    property.size != null ? { icon: Maximize, label: "Size", value: `${property.size} sq ft` } : null,
    property.floor != null ? { icon: Layers, label: "Floor", value: `${property.floor}${property.total_floors ? ` / ${property.total_floors}` : ""}` } : null,
  ].filter(Boolean) as { icon: typeof Bed; label: string; value: string | number }[];

  const depositText = (() => {
    if (property.deposit_amount == null) return null;
    if (property.deposit_type === "PERCENTAGE") return `${property.deposit_amount}% of rent`;
    return `${property.currency || "KES"} ${property.deposit_amount.toLocaleString()}`;
  })();

  const createdDate = property.createdAt
    ? new Date(property.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  const amenities = property.amenities ?? [];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/properties" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors mt-0.5">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">{property.title}</h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
                {statusLabel}
              </span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${property.is_published ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                {property.is_published ? "Published" : "Draft"}
              </span>
            </div>
            {location && (
              <p className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] mt-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {location}
                {property.zip_code && <span className="text-[var(--muted-foreground)]">({property.zip_code})</span>}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <Link href={`/properties/${id}/edit`} className="inline-flex items-center h-9 px-4 text-sm font-medium rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white transition-colors">
            <Pencil className="h-4 w-4 mr-1.5" />
            Edit
          </Link>
          <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting} className="rounded-lg h-9">
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <div className="relative aspect-[16/8] bg-[var(--muted)]">
          {hasImages ? (
            <>
              <img
                src={images[activeImg]?.url}
                alt={property.title}
                className="h-full w-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-[var(--foreground)] hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-[var(--foreground)] hover:bg-white transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImg(i)}
                        className={`h-2 rounded-full transition-all ${i === activeImg ? "w-6 bg-white" : "w-2 bg-white/50"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center gap-2">
              <Building2 className="h-14 w-14 text-[var(--muted-foreground)] opacity-50" />
              <span className="text-sm text-[var(--muted-foreground)]">No images uploaded</span>
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto bg-[var(--card)]">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveImg(i)}
                className={`flex-shrink-0 h-16 w-24 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImg ? "border-[var(--primary)]" : "border-transparent hover:border-[var(--border)]"}`}
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                <s.icon className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">{s.label}</p>
                <p className="text-base font-semibold text-[var(--foreground)]">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Property Info */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wide">Property Info</h2>
          <div className="space-y-0">
            <Row icon={Home} label="Type" value={property.property_type?.toLowerCase().replace("_", " ") || "—"} capitalize />
            <Row icon={Tag} label="Price" value={property.price != null ? `${property.currency || "KES"} ${property.price.toLocaleString()} / ${property.payment_frequency?.toLowerCase() || "month"}` : "—"} />
            {depositText && <Row icon={Banknote} label="Deposit" value={depositText} />}
            <Row icon={MapPin} label="Address" value={property.address || "—"} />
            <Row label="City" value={property.city || "—"} />
            <Row label="Country" value={property.country || "—"} />
            {property.zip_code && <Row label="Zip Code" value={property.zip_code} />}
            {(property.latitude != null && property.latitude !== 0) && (
              <Row icon={Globe} label="Coordinates" value={`${property.latitude}, ${property.longitude}`} />
            )}
            <Row icon={ShieldCheck} label="Published" value={property.is_published ? "Yes" : "No"} />
            {createdDate && <Row icon={Calendar} label="Created" value={createdDate} />}
          </div>
        </div>

        {/* Features & Counts */}
        <div className="space-y-4">
          {/* Features */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wide">Features</h2>
            <div className="flex flex-wrap gap-2">
              {property.is_furnished && (
                <Badge icon={Sofa} label="Furnished" />
              )}
              {property.balcony && (
                <Badge icon={Fence} label="Balcony" />
              )}
              {property.floor != null && (
                <Badge icon={Layers} label={`Floor ${property.floor}${property.total_floors ? ` of ${property.total_floors}` : ""}`} />
              )}
              {!property.is_furnished && !property.balcony && property.floor == null && (
                <span className="text-sm text-[var(--muted-foreground)]">No features listed</span>
              )}
            </div>
          </div>

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-5 space-y-3">
              <h2 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wide flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Amenities
              </h2>
              <div className="flex flex-wrap gap-2">
                {amenities.map((a) => (
                  <span key={a} className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--muted)] px-3 py-1 text-xs font-medium text-[var(--foreground)]">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Counts */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4 text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-[var(--foreground)]">{property._count?.tenants ?? 0}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Tenants</p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4 text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 mb-2">
                <ClipboardList className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-[var(--foreground)]">{property._count?.property_applications ?? 0}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Applications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {property.description && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-5 space-y-3">
          <h2 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wide">Description</h2>
          <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">{property.description}</p>
        </div>
      )}
    </div>
  );
}

function Row({ icon: Icon, label, value, capitalize }: { icon?: typeof Home; label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-b-0">
      <span className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </span>
      <span className={`text-sm font-medium text-[var(--foreground)] text-right max-w-[60%] ${capitalize ? "capitalize" : ""}`}>{value}</span>
    </div>
  );
}

function Badge({ icon: Icon, label }: { icon: typeof Sofa; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] bg-[var(--muted)]">
      <Icon className="h-3.5 w-3.5" /> {label}
    </span>
  );
}
