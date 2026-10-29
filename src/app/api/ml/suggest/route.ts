import { assertAuthenticated, handleApiError } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { asOfToday, loadProfileSide, negotiationFromPair } from "@/lib/ml/catalog";
import {
  acceptanceLabel,
  predictAcceptance,
  predictCache,
  roundCache,
} from "@/lib/ml/predict";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  toProfileId: z.string().min(1),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  amount: z.number().positive().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await assertAuthenticated();
    const body = bodySchema.parse(await request.json());
    const account = await prisma.user.findUnique({ where: { id: user.id } });

    if (!account?.activeProfileId) {
      return NextResponse.json(
        {
          available: false,
          message: "Selecione um perfil ativo para estimar o cachê.",
          suggestedAmount: null,
          acceptanceProbability: null,
          acceptanceLabel: null,
        },
        { status: 400 },
      );
    }

    const [fromSide, toSide] = await Promise.all([
      loadProfileSide(account.activeProfileId),
      loadProfileSide(body.toProfileId),
    ]);

    const talent = fromSide?.role === "talent" ? fromSide.talent : toSide?.role === "talent" ? toSide.talent : null;
    const venue = fromSide?.role === "venue" ? fromSide.venue : toSide?.role === "venue" ? toSide.venue : null;

    if (!talent || !venue) {
      return NextResponse.json({
        available: false,
        message: "A sugestão de cachê compara um estabelecimento com uma banda ou um músico.",
        suggestedAmount: null,
        acceptanceProbability: null,
        acceptanceLabel: null,
      });
    }

    const negotiation = negotiationFromPair(talent, venue, body.eventDate.slice(0, 10));
    const rawCache = predictCache(negotiation);
    const suggestedAmount = roundCache(rawCache);

    let probability: number | null = null;
    if (body.amount && body.amount > 0) {
      probability = predictAcceptance({
        ...negotiation,
        amount: body.amount,
        asOf: asOfToday(),
        suggestedAmount: rawCache,
      });
    }

    return NextResponse.json({
      available: true,
      suggestedAmount,
      acceptanceProbability: probability,
      acceptanceLabel: probability === null ? null : acceptanceLabel(probability),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
