import { apiFetch } from "./client";

export interface ProposalSuggestion {
  available: boolean;
  message?: string;
  suggestedAmount: number | null;
  acceptanceProbability: number | null;
  acceptanceLabel: "alta" | "media" | "baixa" | null;
  acceptanceTarget?: "band" | "venue";
}

export interface SimilarProfile {
  kind: "band" | "musician";
  id: string;
  name: string;
  genre: string;
  location: string;
  href: string;
}

export interface SimilarProfilesResponse {
  clusterId: number;
  clusterName: string;
  similar: SimilarProfile[];
}

export function suggestProposal(input: {
  toProfileId: string;
  eventDate: string;
  amount?: number;
}) {
  return apiFetch<ProposalSuggestion>("/api/ml/suggest", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchSimilarProfiles(kind: "band" | "musician", id: string) {
  const search = new URLSearchParams({ kind, id });
  return apiFetch<SimilarProfilesResponse>(`/api/ml/similar?${search.toString()}`);
}

export interface RecommendationMatch {
  id: string;
  name: string;
  detail: string;
  location: string;
  href: string;
  score: number;
  acceptanceProbability: number;
  historyRate: number;
  suggestedAmount: number;
  reasons: string[];
}

export interface RecommendationsResponse {
  referenceDate: string;
  items: RecommendationMatch[];
}

export function fetchRecommendations(kind: "band" | "establishment", id: string) {
  const search = new URLSearchParams({ kind, id });
  return apiFetch<RecommendationsResponse>(`/api/ml/recommendations?${search.toString()}`);
}
