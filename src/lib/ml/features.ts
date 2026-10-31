import classificationArtifact from "./artifacts/classification.json";
import clusteringArtifact from "./artifacts/clustering.json";
import regressionArtifact from "./artifacts/regression.json";

export type RegressionArtifact = typeof regressionArtifact;
export type ClassificationArtifact = typeof classificationArtifact;
export type ClusteringArtifact = typeof clusteringArtifact;

const GENRE_RULES: Array<[string, string]> = [
  ["eletr", "Eletronica"],
  ["sertanej", "Sertanejo"],
  ["forro", "Forro"],
  ["pagode", "Samba"],
  ["samba", "Samba"],
  ["jazz", "Jazz"],
  ["blues", "Blues"],
  ["mpb", "MPB"],
  ["indie", "Rock"],
  ["rock", "Rock"],
  ["pop", "Pop"],
];

export function fold(value: string): string {
  return (value || "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export function citySlug(city: string): string {
  return fold(city)
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export function parsePriceMidpoint(text: string | null | undefined): number {
  if (!text) return 0;
  const numbers = text.match(/\d{1,3}(?:\.\d{3})+|\d+/g) ?? [];
  const values = numbers.map((number) => Number(number.replace(/\./g, "")));
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function canonicalGenre(value: string | string[] | null | undefined): string | null {
  if (!value) return null;
  const tokens = Array.isArray(value) ? value : value.split(/[,/]/);
  for (const token of tokens) {
    const folded = fold(token);
    for (const [needle, genre] of GENRE_RULES) {
      if (folded.includes(needle)) return genre;
    }
  }
  return null;
}

export function experienceFromShows(shows: number, cuts: number[]): number {
  const [low, high] = cuts;
  if (shows < low) return 0;
  if (shows < high) return 1;
  return 2;
}

export function experienceFromLabel(label: string | null | undefined): number {
  const folded = fold(label || "");
  if (folded.startsWith("inic")) return 0;
  if (folded.startsWith("inter")) return 1;
  if (folded.startsWith("prof")) return 2;
  return 1;
}

export function sameCity(left?: string | null, right?: string | null): number {
  if (!left || !right) return 0;
  return fold(left) === fold(right) ? 1 : 0;
}

export function weekdayMonday0(isoDate: string): number {
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  return (utc.getUTCDay() + 6) % 7;
}

export function dayFlags(isoDate: string): {
  is_friday: number;
  is_saturday: number;
  is_sunday: number;
} {
  const day = weekdayMonday0(isoDate);
  return {
    is_friday: day === 4 ? 1 : 0,
    is_saturday: day === 5 ? 1 : 0,
    is_sunday: day === 6 ? 1 : 0,
  };
}

export function dayKindLabel(isoDate: string): string {
  const day = weekdayMonday0(isoDate);
  if (day === 4) return "sexta";
  if (day === 5) return "sábado";
  if (day === 6) return "domingo";
  return "dia de semana";
}

export function leadDays(eventDate: string, asOf: string): number {
  const [eventYear, eventMonth, eventDay] = eventDate.slice(0, 10).split("-").map(Number);
  const [asOfYear, asOfMonth, asOfDay] = asOf.slice(0, 10).split("-").map(Number);
  const eventUtc = Date.UTC(eventYear, eventMonth - 1, eventDay);
  const asOfUtc = Date.UTC(asOfYear, asOfMonth - 1, asOfDay);
  return Math.max(0, Math.round((eventUtc - asOfUtc) / 86_400_000));
}

export function genreMatch(
  genre: string | null,
  establishmentType: string | null | undefined,
  compatibility: Record<string, string[]>,
): number {
  if (!genre || !establishmentType) return 0;
  return compatibility[establishmentType]?.includes(genre) ? 1 : 0;
}

export interface NegotiationInput {
  capacity: number;
  members: number;
  experience: number;
  talentLocation: string;
  venueLocation: string;
  eventDate: string;
  rating: number;
  shows: number;
  talentPrice: string;
  venueBudget: string;
  genre: string | string[];
  establishmentType: string;
}

export interface ClassificationInput extends NegotiationInput {
  amount: number;
  asOf: string;
  suggestedAmount: number;
  dateLoad?: number;
}

export interface TalentInput {
  genre: string | string[];
  location: string;
  members: number;
  experience: number;
  rating: number;
  price: string;
}

function vectorFromMap(
  features: Record<string, number>,
  names: string[],
): number[] {
  return names.map((name) => features[name] ?? 0);
}

export function regressionFeatureMap(
  input: NegotiationInput,
  artifact: RegressionArtifact = regressionArtifact,
): Record<string, number> {
  const genre = canonicalGenre(input.genre);
  const { vocab } = artifact;
  const features: Record<string, number> = {
    capacity: input.capacity,
    members: input.members,
    experience: input.experience,
    same_city: sameCity(input.talentLocation, input.venueLocation),
    ...dayFlags(input.eventDate),
    rating: input.rating,
    shows: input.shows,
    talent_price_mid: parsePriceMidpoint(input.talentPrice),
    venue_budget_mid: parsePriceMidpoint(input.venueBudget),
  };

  for (const name of vocab.genres) {
    if (name === vocab.genreReference) continue;
    features[`genre_${name}`] = genre === name ? 1 : 0;
  }
  for (const name of vocab.establishmentTypes) {
    if (name === vocab.typeReference) continue;
    features[`type_${name}`] = input.establishmentType === name ? 1 : 0;
  }
  return features;
}

export function regressionVector(
  input: NegotiationInput,
  artifact: RegressionArtifact = regressionArtifact,
): number[] {
  return vectorFromMap(regressionFeatureMap(input, artifact), artifact.featureNames);
}

export function classificationFeatureMap(
  input: ClassificationInput,
  artifact: ClassificationArtifact = classificationArtifact,
): Record<string, number> {
  const genre = canonicalGenre(input.genre);
  const ratio = input.amount / Math.max(input.suggestedAmount, 1);
  const load = Math.min(5, Math.max(0, input.dateLoad ?? 0));
  return {
    offer_log: Math.log(Math.max(ratio, 0.2)),
    date_load: load,
    genre_match: genreMatch(genre, input.establishmentType, artifact.vocab.compatibility),
    capacity: input.capacity,
    experience: input.experience,
    same_city: sameCity(input.talentLocation, input.venueLocation),
    lead_days: leadDays(input.eventDate, input.asOf),
    rating: input.rating,
  };
}

export function classificationVector(
  input: ClassificationInput,
  artifact: ClassificationArtifact = classificationArtifact,
): number[] {
  return vectorFromMap(
    classificationFeatureMap(input, artifact),
    artifact.featureNames,
  );
}

export function venueFeatureMap(
  input: ClassificationInput,
  artifact: { vocab: ClassificationArtifact["vocab"]; featureNames: string[] } = classificationArtifact,
): Record<string, number> {
  const ratio = input.amount / Math.max(input.suggestedAmount, 1);
  const budget = Math.max(parsePriceMidpoint(input.venueBudget), 1);
  const budgetRatio = input.amount / budget;
  const load = Math.min(5, Math.max(0, input.dateLoad ?? 0));
  return {
    ...classificationFeatureMap(input, artifact as ClassificationArtifact),
    offer_log: Math.log(Math.max(ratio, 0.2)),
    budget_log: Math.log(Math.max(budgetRatio, 0.2)),
    date_load: load,
  };
}

export function venueVector(
  input: ClassificationInput,
  artifact: { vocab: ClassificationArtifact["vocab"]; featureNames: string[] },
): number[] {
  return vectorFromMap(venueFeatureMap(input, artifact), artifact.featureNames);
}

export function clusteringFeatureMap(
  input: TalentInput,
  artifact: ClusteringArtifact = clusteringArtifact,
): Record<string, number> {
  const genre = canonicalGenre(input.genre);
  const slug = citySlug(input.location);
  const features: Record<string, number> = {
    price_mid: parsePriceMidpoint(input.price),
    members: input.members,
    experience: input.experience,
    rating: input.rating,
  };
  for (const name of artifact.vocab.genres) {
    features[`genre_${name}`] = genre === name ? 1 : 0;
  }
  for (const city of artifact.vocab.cities) {
    features[`city_${city.slug}`] = slug === city.slug ? 1 : 0;
  }
  return features;
}

export function clusteringVector(
  input: TalentInput,
  artifact: ClusteringArtifact = clusteringArtifact,
): number[] {
  return vectorFromMap(clusteringFeatureMap(input, artifact), artifact.featureNames);
}

export function todayIso(now = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}
