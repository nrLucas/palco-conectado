import { prisma } from "@/lib/db";
import classificationArtifact from "./artifacts/classification.json";
import priors from "./artifacts/recommendation-priors.json";
import {
  canonicalEstablishmentType,
  loadTalentCatalog,
  loadVenues,
  negotiationFromPair,
  type TalentSnapshot,
  type VenueSnapshot,
} from "./catalog";
import {
  canonicalGenre,
  genreMatch,
  sameCity,
  todayIso,
  weekdayMonday0,
} from "./features";
import { predictAcceptance, predictCache, roundCache } from "./predict";

const FRIDAY = 4;

export interface RankedMatch {
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

export interface RecommendationResult {
  referenceDate: string;
  items: RankedMatch[];
}

interface Counts {
  accepted: number;
  total: number;
}

export function referenceShowDate(now = new Date()): { eventDate: string; asOf: string } {
  const asOf = todayIso(now);
  const [year, month, day] = asOf.split("-").map(Number);
  const cursor = new Date(Date.UTC(year, month - 1, day));
  cursor.setUTCDate(cursor.getUTCDate() + 21);
  while (weekdayMonday0(cursor.toISOString().slice(0, 10)) !== FRIDAY) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return { eventDate: cursor.toISOString().slice(0, 10), asOf };
}

function historyRate(establishmentType: string, genre: string | null, real?: Counts): number {
  const table = priors.byTypeAndGenre as Record<string, { rate: number } | undefined>;
  const cell = genre ? table[`${establishmentType}|${genre}`] : undefined;
  const priorRate = cell?.rate ?? priors.global.rate;
  if (!real || real.total === 0) return priorRate;
  const local = (real.accepted + 1) / (real.total + 2);
  return 0.5 * priorRate + 0.5 * local;
}

function pairReasons(
  band: TalentSnapshot,
  venue: VenueSnapshot,
  genre: string | null,
  history: number,
): string[] {
  const reasons: string[] = [];
  if (sameCity(band.location, venue.location)) reasons.push("Mesma cidade");
  if (genreMatch(genre, venue.type, classificationArtifact.vocab.compatibility)) {
    reasons.push("Gênero compatível com o tipo de casa");
  }
  reasons.push(
    history >= priors.global.rate
      ? "Histórico favorável deste tipo de casa"
      : "Histórico mais restrito deste tipo de casa",
  );
  return reasons;
}

export function scorePair(
  band: TalentSnapshot,
  venue: VenueSnapshot,
  real: Counts | undefined,
  reference: { eventDate: string; asOf: string },
): RankedMatch {
  const genre = canonicalGenre(band.genre);
  const negotiation = negotiationFromPair(band, venue, reference.eventDate);
  const rawCache = predictCache(negotiation);
  const acceptanceProbability = predictAcceptance({
    ...negotiation,
    amount: rawCache,
    suggestedAmount: rawCache,
    asOf: reference.asOf,
  });
  const history = historyRate(venue.type, genre, real);
  const score = priors.modelWeight * acceptanceProbability + priors.historyWeight * history;

  return {
    id: "",
    name: "",
    detail: "",
    location: "",
    href: "",
    score,
    acceptanceProbability,
    historyRate: history,
    suggestedAmount: roundCache(rawCache),
    reasons: pairReasons(band, venue, genre, history),
  };
}

async function loadRealHistory(): Promise<{
  byVenueAndGenre: Map<string, Counts>;
  byVenue: Map<string, Counts>;
}> {
  const decided = await prisma.proposal.findMany({
    where: { status: { in: ["accepted", "rejected"] } },
    include: { fromProfile: true, toProfile: true },
  });

  const bandIds = new Set<string>();
  const venueIds = new Set<string>();
  for (const proposal of decided) {
    for (const profile of [proposal.fromProfile, proposal.toProfile]) {
      if (profile.type === "banda") bandIds.add(profile.entityId);
      if (profile.type === "contratante") venueIds.add(profile.entityId);
    }
  }

  const [bands, venues] = await Promise.all([
    bandIds.size
      ? prisma.band.findMany({ where: { id: { in: [...bandIds] } } })
      : Promise.resolve([]),
    venueIds.size
      ? prisma.establishment.findMany({ where: { id: { in: [...venueIds] } } })
      : Promise.resolve([]),
  ]);
  const genreByBand = new Map(bands.map((band) => [band.id, canonicalGenre(band.genre)]));
  const typeByVenue = new Map(
    venues.map((venue) => [venue.id, canonicalEstablishmentType(venue.type)]),
  );

  const byVenueAndGenre = new Map<string, Counts>();
  const byVenue = new Map<string, Counts>();

  const bump = (map: Map<string, Counts>, key: string, accepted: boolean) => {
    const current = map.get(key) ?? { accepted: 0, total: 0 };
    current.total += 1;
    if (accepted) current.accepted += 1;
    map.set(key, current);
  };

  for (const proposal of decided) {
    const profiles = [proposal.fromProfile, proposal.toProfile];
    const band = profiles.find((profile) => profile.type === "banda");
    const venue = profiles.find((profile) => profile.type === "contratante");
    if (!band || !venue) continue;
    const genre = genreByBand.get(band.entityId);
    if (!typeByVenue.has(venue.entityId) || !genre) continue;
    const accepted = proposal.status === "accepted";
    bump(byVenue, venue.entityId, accepted);
    bump(byVenueAndGenre, `${venue.entityId}|${genre}`, accepted);
  }

  return { byVenueAndGenre, byVenue };
}

function realCounts(
  history: Awaited<ReturnType<typeof loadRealHistory>>,
  venueId: string,
  genre: string | null,
): Counts | undefined {
  if (genre) {
    const specific = history.byVenueAndGenre.get(`${venueId}|${genre}`);
    if (specific && specific.total > 0) return specific;
  }
  return history.byVenue.get(venueId);
}

function topMatches(items: RankedMatch[]): RankedMatch[] {
  return items
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name, "pt-BR"))
    .slice(0, 3);
}

export async function recommendForBand(bandId: string): Promise<RecommendationResult | null> {
  const [catalog, venues, history] = await Promise.all([
    loadTalentCatalog(),
    loadVenues(),
    loadRealHistory(),
  ]);
  const band = catalog.find((talent) => talent.kind === "band" && talent.id === bandId);
  if (!band) return null;

  const reference = referenceShowDate();
  const items = topMatches(
    venues.map((venue) => {
      const scored = scorePair(
        band,
        venue,
        realCounts(history, venue.id, canonicalGenre(band.genre)),
        reference,
      );
      return {
        ...scored,
        id: venue.id,
        name: venue.name,
        detail: venue.type,
        location: venue.location,
        href: `/estabelecimento/${venue.id}`,
      };
    }),
  );

  return { referenceDate: reference.eventDate, items };
}

export async function recommendForEstablishment(
  establishmentId: string,
): Promise<RecommendationResult | null> {
  const [catalog, venues, history] = await Promise.all([
    loadTalentCatalog(),
    loadVenues(),
    loadRealHistory(),
  ]);
  const venue = venues.find((item) => item.id === establishmentId);
  if (!venue) return null;

  const reference = referenceShowDate();
  const items = topMatches(
    catalog
      .filter((talent) => talent.kind === "band")
      .map((band) => {
        const scored = scorePair(
          band,
          venue,
          realCounts(history, venue.id, canonicalGenre(band.genre)),
          reference,
        );
        return {
          ...scored,
          id: band.id,
          name: band.name,
          detail: band.genreLabel,
          location: band.location,
          href: `/banda/${band.id}`,
        };
      }),
  );

  return { referenceDate: reference.eventDate, items };
}
