import { apiFetch } from "./client";
import type { Establishment } from "@/lib/types";

export function fetchEstablishments(params?: {
  query?: string;
  location?: string;
  type?: string;
  minRating?: number;
}) {
  const search = new URLSearchParams();
  if (params?.query) search.set("query", params.query);
  if (params?.location) search.set("location", params.location);
  if (params?.type) search.set("type", params.type);
  if (params?.minRating) search.set("minRating", String(params.minRating));
  const qs = search.toString();
  return apiFetch<Establishment[]>(
    `/api/establishments${qs ? `?${qs}` : ""}`
  );
}

export function fetchEstablishment(id: string) {
  return apiFetch<Establishment & { profileId?: string }>(
    `/api/establishments/${id}`
  );
}

export function updateEstablishment(
  id: string,
  data: Partial<Establishment>
) {
  return apiFetch<Establishment>(`/api/establishments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteEstablishment(id: string) {
  return apiFetch<{ success: boolean }>(`/api/establishments/${id}`, {
    method: "DELETE",
  });
}
