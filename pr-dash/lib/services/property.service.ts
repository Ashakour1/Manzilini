import { api } from "@/lib/api";
import { requestFormData } from "@/lib/api";
import type { Property } from "@/lib/types";

export function getProperties() {
  return api.get<Property[]>("/properties/landlord");
}

export function getProperty(id: string) {
  return api.get<Property>(`/properties/${id}`);
}

export function createProperty(data: Record<string, unknown>, images?: File[]) {
  const fd = buildFormData(data, images);
  return requestFormData<Property>("/properties", fd, "POST");
}

export function updateProperty(id: string, data: Record<string, unknown>, images?: File[]) {
  const fd = buildFormData(data, images);
  return requestFormData<Property>(`/properties/${id}`, fd, "PUT");
}

export function deleteProperty(id: string) {
  return api.delete<{ message?: string }>(`/properties/${id}`);
}

export function deletePropertyImage(propertyId: string, imageId: string) {
  return api.delete<{ message?: string }>(`/properties/${propertyId}/images/${imageId}`);
}

function buildFormData(data: Record<string, unknown>, images?: File[]): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      fd.append(key, JSON.stringify(value));
    } else {
      fd.append(key, String(value));
    }
  }
  if (images && images.length > 0) {
    for (const file of images) {
      fd.append("images", file);
    }
  }
  return fd;
}
