import { apiFetch } from "./client";
import type { Musician } from "@/lib/types";

export function fetchMusicians(params?: {
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
  return apiFetch<Musician[]>(`/api/musicians${qs ? `?${qs}` : ""}`);
}

export function fetchMusician(id: string) {
  return apiFetch<Musician & { profileId?: string }>(`/api/musicians/${id}`);
}
