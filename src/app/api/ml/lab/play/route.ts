import { todayIso } from "@/lib/ml/features";
import {
  acceptanceLabel,
  assignCluster,
  predictAcceptance,
  predictCache,
  predictVenueAcceptance,
  roundCache,
} from "@/lib/ml/predict";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  genre: z.string().min(1),
  establishmentType: z.string().min(1),
  capacity: z.number().positive(),
  members: z.number().positive(),
  talentLocation: z.string().min(1),
  venueLocation: z.string().min(1),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  rating: z.number().min(0).max(5),
  shows: z.number().min(0),
  talentPrice: z.string().min(1),
  venueBudget: z.string().min(1),
  amount: z.number().positive().optional(),
  experience: z.number().int().min(0).max(2),
  dateLoad: z.number().int().min(0).max(5).optional(),
  side: z.enum(["house", "talent"]).optional(),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Cenário inválido" }, { status: 400 });
  }

  const input = parsed.data;
  const negotiation = {
    capacity: input.capacity,
    members: input.members,
    experience: input.experience,
    talentLocation: input.talentLocation,
    venueLocation: input.venueLocation,
    eventDate: input.eventDate.slice(0, 10),
    rating: input.rating,
    shows: input.shows,
    talentPrice: input.talentPrice,
    venueBudget: input.venueBudget,
    genre: input.genre,
    establishmentType: input.establishmentType,
  };
  const rawCache = predictCache(negotiation);
  const suggestedAmount = roundCache(rawCache);
  const amount = input.amount ?? suggestedAmount;
  const scenario = {
    ...negotiation,
    amount,
    asOf: todayIso(),
    suggestedAmount: rawCache,
    dateLoad: input.dateLoad ?? 0,
  };
  const acceptanceProbability =
    input.side === "talent" ? predictVenueAcceptance(scenario) : predictAcceptance(scenario);
  const cluster = assignCluster({
    genre: input.genre,
    location: input.talentLocation,
    members: input.members,
    experience: input.experience,
    rating: input.rating,
    price: input.talentPrice,
  });

  return NextResponse.json({
    suggestedAmount,
    rawCache,
    acceptanceProbability,
    acceptanceLabel: acceptanceLabel(acceptanceProbability),
    clusterId: cluster.clusterId,
    clusterName: cluster.clusterName,
    distance: cluster.distance,
  });
}
