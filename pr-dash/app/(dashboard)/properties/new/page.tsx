"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Image as ImageIcon, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createProperty } from "@/lib/services/property.service";

const PROPERTY_TYPES = ["APARTMENT", "HOUSE", "COMMERCIAL", "OFFICE", "STUDIO", "LAND"];
const STATUSES = ["FOR_RENT", "FOR_SALE", "RENTED", "SOLD"];
const CURRENCIES = ["KES", "USD", "EUR", "GBP"];
const PAYMENT_FREQUENCIES = ["MONTHLY", "WEEKLY", "YEARLY", "DAILY"];

const inputClass =
  "w-full h-10 px-3 border border-[var(--border)] rounded-lg text-sm bg-[var(--card)] focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--primary)] outline-none transition-colors";
const selectClass = inputClass;
const labelClass = "block text-xs font-medium text-[var(--muted-foreground)] mb-1.5";

const emptyForm = {
  title: "",
  description: "",
  property_type: "APARTMENT",
  status: "FOR_RENT",
  price: "",
  currency: "KES",
  payment_frequency: "MONTHLY",
  deposit_amount: "",
  deposit_type: "FIXED",
  country: "Kenya",
  city: "",
  address: "",
  zip_code: "",
  latitude: "",
  longitude: "",
  bedrooms: "",
  bathrooms: "",
  garages: "",
  size: "",
  is_furnished: false,
  floor: "",
  total_floors: "",
  balcony: false,
  amenities: "",
};

export default function NewPropertyPage() {
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const amenityList = useMemo(
    () =>
      form.amenities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [form.amenities],
  );

  const set = (field: keyof typeof form, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const remaining = 10 - images.length;
    const toAdd = files.slice(0, remaining);
    setImages((prev) => [...prev, ...toAdd]);
    setPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        property_type: form.property_type,
        status: form.status,
        price: form.price,
        currency: form.currency,
        payment_frequency: form.payment_frequency,
        deposit_amount: form.deposit_amount || undefined,
        deposit_type: form.deposit_type,
        country: form.country,
        city: form.city,
        address: form.address,
        zip_code: form.zip_code || undefined,
        latitude: form.latitude || undefined,
        longitude: form.longitude || undefined,
        bedrooms: form.bedrooms || undefined,
        bathrooms: form.bathrooms || undefined,
        garages: form.garages || undefined,
        size: form.size || undefined,
        is_furnished: form.is_furnished,
        floor: form.floor || undefined,
        total_floors: form.total_floors || undefined,
        balcony: form.balcony,
        amenities: amenityList.length > 0 ? amenityList : undefined,
        is_published: false,
      };
      // landlord_id is derived from user on the backend (no getProfile needed)

      await createProperty(payload, images.length > 0 ? images : undefined);
      window.location.href = "/properties";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/properties"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Create New Property</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            Complete the details below to list your property
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          {error}
          <button onClick={() => setError("")} className="font-medium hover:opacity-80">
            &times;
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Overview ─────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Basic details about the listing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  className={inputClass}
                  placeholder="Modern 2BR apartment"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>
                  Property Type <span className="text-red-500">*</span>
                </label>
                <select value={form.property_type} onChange={(e) => set("property_type", e.target.value)} className={selectClass}>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className={`${inputClass} h-auto py-2.5 resize-none`}
                rows={4}
                placeholder="Describe the property, highlight the location, finishes, and special perks."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className={labelClass}>Status</label>
                <select value={form.status} onChange={(e) => set("status", e.target.value)} className={selectClass}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Currency</label>
                <select value={form.currency} onChange={(e) => set("currency", e.target.value)} className={selectClass}>
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  className={inputClass}
                  placeholder="25000"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Payment Frequency</label>
                <select value={form.payment_frequency} onChange={(e) => set("payment_frequency", e.target.value)} className={selectClass}>
                  {PAYMENT_FREQUENCIES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className={labelClass}>Deposit Amount</label>
                <div className="flex gap-2">
                  <select
                    value={form.deposit_type}
                    onChange={(e) => set("deposit_type", e.target.value)}
                    className={`${selectClass} w-24 flex-shrink-0`}
                  >
                    <option value="FIXED">Fixed</option>
                    <option value="PERCENTAGE">%</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    max={form.deposit_type === "PERCENTAGE" ? "100" : undefined}
                    value={form.deposit_amount}
                    onChange={(e) => set("deposit_amount", e.target.value)}
                    className={`${inputClass} flex-1`}
                    placeholder={form.deposit_type === "PERCENTAGE" ? "10" : "5000"}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Bedrooms</label>
                <input type="number" min="0" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} className={inputClass} placeholder="2" />
              </div>
              <div>
                <label className={labelClass}>Bathrooms</label>
                <input type="number" min="0" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} className={inputClass} placeholder="2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Location ─────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </CardTitle>
            <CardDescription>Exact address and coordinates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Country <span className="text-red-500">*</span>
                </label>
                <input value={form.country} onChange={(e) => set("country", e.target.value)} className={inputClass} placeholder="Kenya" required />
              </div>
              <div>
                <label className={labelClass}>
                  City <span className="text-red-500">*</span>
                </label>
                <input value={form.city} onChange={(e) => set("city", e.target.value)} className={inputClass} placeholder="Nairobi" required />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
              <div>
                <label className={labelClass}>
                  Address <span className="text-red-500">*</span>
                </label>
                <input value={form.address} onChange={(e) => set("address", e.target.value)} className={inputClass} placeholder="123 Main St" required />
              </div>
              <div>
                <label className={labelClass}>Zip Code</label>
                <input value={form.zip_code} onChange={(e) => set("zip_code", e.target.value)} className={inputClass} placeholder="00100" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Latitude</label>
                <input type="number" step="any" value={form.latitude} onChange={(e) => set("latitude", e.target.value)} className={inputClass} placeholder="-1.2921" />
              </div>
              <div>
                <label className={labelClass}>Longitude</label>
                <input type="number" step="any" value={form.longitude} onChange={(e) => set("longitude", e.target.value)} className={inputClass} placeholder="36.8219" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Features ─────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>Dimensions and amenities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className={labelClass}>Garages</label>
                <input type="number" min="0" value={form.garages} onChange={(e) => set("garages", e.target.value)} className={inputClass} placeholder="1" />
              </div>
              <div>
                <label className={labelClass}>Size (sq ft)</label>
                <input type="number" min="0" value={form.size} onChange={(e) => set("size", e.target.value)} className={inputClass} placeholder="1200" />
              </div>
              <div>
                <label className={labelClass}>Floor</label>
                <input type="number" min="0" value={form.floor} onChange={(e) => set("floor", e.target.value)} className={inputClass} placeholder="5" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className={labelClass}>Total Floors</label>
                <input type="number" min="0" value={form.total_floors} onChange={(e) => set("total_floors", e.target.value)} className={inputClass} placeholder="10" />
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] px-3 py-2.5">
                <input
                  type="checkbox"
                  id="is_furnished"
                  checked={form.is_furnished}
                  onChange={(e) => set("is_furnished", e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--ring)]"
                />
                <label htmlFor="is_furnished" className="text-sm font-medium text-[var(--foreground)] cursor-pointer">
                  Furnished
                </label>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] px-3 py-2.5">
                <input
                  type="checkbox"
                  id="balcony"
                  checked={form.balcony}
                  onChange={(e) => set("balcony", e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--ring)]"
                />
                <label htmlFor="balcony" className="text-sm font-medium text-[var(--foreground)] cursor-pointer">
                  Balcony
                </label>
              </div>
            </div>
            <div>
              <label className={labelClass}>Amenities (comma separated)</label>
              <textarea
                value={form.amenities}
                onChange={(e) => set("amenities", e.target.value)}
                className={`${inputClass} h-auto py-2.5 resize-none`}
                rows={2}
                placeholder="Pool, Gym, Parking, Elevator"
              />
              {amenityList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {amenityList.map((a) => (
                    <span key={a} className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--muted)] px-2.5 py-0.5 text-xs text-[var(--foreground)]">
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Images ───────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Images
            </CardTitle>
            <CardDescription>Upload up to 10 property images</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden border border-[var(--border)] aspect-[4/3]">
                    <img src={src} alt={`Preview ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <span className="absolute bottom-1.5 left-1.5 text-[10px] font-medium bg-black/50 text-white px-1.5 py-0.5 rounded">
                      {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {images.length < 10 && (
              <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] py-8 cursor-pointer transition-colors">
                <ImageIcon className="h-8 w-8 text-[var(--muted-foreground)]" />
                <span className="text-sm text-[var(--muted-foreground)]">
                  Click to add images ({images.length}/10)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageAdd}
                  className="hidden"
                />
              </label>
            )}
          </CardContent>
        </Card>

        {/* ── Submit ───────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/properties"
            className="inline-flex items-center justify-center h-9 px-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] text-sm font-medium text-[var(--foreground)] transition-colors"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={saving || !form.title || !form.price || !form.country || !form.city || !form.address}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
          >
            {saving ? "Creating..." : "Create Property"}
          </Button>
        </div>
      </form>
    </div>
  );
}
