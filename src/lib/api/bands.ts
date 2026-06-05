import { apiFetch } from "./client";
import type { Band } from "@/lib/types";

export function fetchBands(params?: {
  query?: string;
  location?: string;
  genre?: string;
  minRating?: number;
}) {
  const search = new URLSearchParams();
  if (params?.query) search.set("query", params.query);
  if (params?.location) search.set("location", params.location);
  if (params?.genre) search.set("genre", params.genre);
  if (params?.minRating) search.set("minRating", String(params.minRating));
  const qs = search.toString();
  return apiFetch<Band[]>(`/api/bands${qs ? `?${qs}` : ""}`);
}

export function fetchBand(id: string) {
  return apiFetch<Band & { profileId?: string }>(`/api/bands/${id}`);
}

export function updateBand(id: string, data: Partial<Band>) {
  return apiFetch<Band>(`/api/bands/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteBand(id: string) {
  return apiFetch<{ success: boolean }>(`/api/bands/${id}`, {
    method: "DELETE",
  });
}
