import { prisma } from "@/lib/db";
import regressionArtifact from "./artifacts/regression.json";
import {
  experienceFromLabel,
  experienceFromShows,
  fold,
  todayIso,
  type NegotiationInput,
  type TalentInput,
} from "./features";

const EXPERIENCE_CUTS = regressionArtifact.vocab.bandExperienceCuts;

export interface TalentSnapshot extends TalentInput {
  kind: "band" | "musician";
  id: string;
  name: string;
  genreLabel: string;
  shows: number;
  profileId: string | null;
}

export interface VenueSnapshot {
  id: string;
  name: string;
  type: string;
  location: string;
  capacity: number;
  budget: string;
}

export function canonicalEstablishmentType(type: string): string {
  const folded = fold(type);
  return (
    regressionArtifact.vocab.establishmentTypes.find((item) => fold(item) === folded) ?? type
  );
}

export async function loadProfileSide(profileId: string) {
  const profile = await prisma.profile.findUnique({ where: { id: profileId } });
  if (!profile) return null;

  if (profile.type === "banda") {
    const band = await prisma.band.findUnique({ where: { id: profile.entityId } });
    if (!band) return null;
    const talent: TalentSnapshot = {
      kind: "band",
      id: band.id,
      name: band.name,
      genre: band.genre,
      genreLabel: band.genre,
      location: band.location,
      members: band.members,
      experience: experienceFromShows(band.totalShows, EXPERIENCE_CUTS),
      rating: band.rating,
      shows: band.totalShows,
      price: band.priceRange,
      profileId: profile.id,
    };
    return { role: "talent" as const, talent };
  }

  if (profile.type === "artista_independente") {
    const musician = await prisma.musician.findUnique({ where: { id: profile.entityId } });
    if (!musician) return null;
    const talent: TalentSnapshot = {
      kind: "musician",
      id: musician.id,
      name: musician.name,
      genre: musician.genres,
      genreLabel: musician.genres.join(", "),
      location: musician.location,
      members: 1,
      experience: experienceFromLabel(musician.experience),
      rating: musician.rating,
      shows: musician.totalGigs,
      price: musician.pricePerGig ?? "",
      profileId: profile.id,
    };
    return { role: "talent" as const, talent };
  }

  if (profile.type === "contratante") {
    const venue = await prisma.establishment.findUnique({ where: { id: profile.entityId } });
    if (!venue) return null;
    const snapshot: VenueSnapshot = {
      id: venue.id,
      name: venue.name,
      type: canonicalEstablishmentType(venue.type),
      location: venue.location,
      capacity: venue.capacity,
      budget: venue.averageBudget,
    };
    return { role: "venue" as const, venue: snapshot };
  }

  return null;
}

export function negotiationFromPair(
  talent: TalentSnapshot,
  venue: VenueSnapshot,
  eventDate: string,
): NegotiationInput {
  return {
    capacity: venue.capacity,
    members: talent.members,
    experience: talent.experience,
    talentLocation: talent.location,
    venueLocation: venue.location,
    eventDate,
    rating: talent.rating,
    shows: talent.shows,
    talentPrice: talent.price,
    venueBudget: venue.budget,
    genre: talent.genre,
    establishmentType: venue.type,
  };
}

export function asOfToday(): string {
  return todayIso();
}

export async function loadTalentCatalog(): Promise<TalentSnapshot[]> {
  const [bands, musicians, profiles] = await Promise.all([
    prisma.band.findMany(),
    prisma.musician.findMany(),
    prisma.profile.findMany({
      where: { type: { in: ["banda", "artista_independente"] } },
      select: { id: true, type: true, entityId: true },
    }),
  ]);

  const profileByEntity = new Map(
    profiles.map((profile) => [`${profile.type}:${profile.entityId}`, profile.id]),
  );

  const bandTalents: TalentSnapshot[] = bands.map((band) => ({
    kind: "band",
    id: band.id,
    name: band.name,
    genre: band.genre,
    genreLabel: band.genre,
    location: band.location,
    members: band.members,
    experience: experienceFromShows(band.totalShows, EXPERIENCE_CUTS),
    rating: band.rating,
    shows: band.totalShows,
    price: band.priceRange,
    profileId: profileByEntity.get(`banda:${band.id}`) ?? null,
  }));

  const musicianTalents: TalentSnapshot[] = musicians.map((musician) => ({
    kind: "musician",
    id: musician.id,
    name: musician.name,
    genre: musician.genres,
    genreLabel: musician.genres.join(", "),
    location: musician.location,
    members: 1,
    experience: experienceFromLabel(musician.experience),
    rating: musician.rating,
    shows: musician.totalGigs,
    price: musician.pricePerGig ?? "",
    profileId: profileByEntity.get(`artista_independente:${musician.id}`) ?? null,
  }));

  return [...bandTalents, ...musicianTalents];
}

export async function loadVenues(): Promise<VenueSnapshot[]> {
  const rows = await prisma.establishment.findMany({ orderBy: { name: "asc" } });
  return rows.map((venue) => ({
    id: venue.id,
    name: venue.name,
    type: canonicalEstablishmentType(venue.type),
    location: venue.location,
    capacity: venue.capacity,
    budget: venue.averageBudget,
  }));
}

export function talentHref(talent: Pick<TalentSnapshot, "kind" | "id">): string {
  return talent.kind === "band" ? `/banda/${talent.id}` : `/musico/${talent.id}`;
}
