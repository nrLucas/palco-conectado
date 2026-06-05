import { prisma } from "@/lib/db";
import {
  assertAuthenticated,
  handleApiError,
} from "@/lib/auth/permissions";
import { NextResponse } from "next/server";
import { z } from "zod";

const createProposalSchema = z.object({
  toProfileId: z.string(),
  eventDate: z.string(),
  message: z.string().min(1),
  amount: z.number().min(0),
});

export async function GET(request: Request) {
  try {
    const user = await assertAuthenticated();
    const { searchParams } = new URL(request.url);
    const direction = searchParams.get("direction") || "received";

    const proposals = await prisma.proposal.findMany({
      where:
        direction === "sent"
          ? { fromUserId: user.id }
          : { toUserId: user.id },
      include: {
        fromProfile: true,
        toProfile: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(proposals);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await assertAuthenticated();
    const body = createProposalSchema.parse(await request.json());

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser?.activeProfileId) {
      return NextResponse.json(
        { error: "Selecione um perfil ativo para enviar propostas" },
        { status: 400 }
      );
    }

    if (dbUser.proposalsUsed >= dbUser.proposalsLimit) {
      return NextResponse.json(
        {
          error: `Limite de ${dbUser.proposalsLimit} propostas atingido. Faça upgrade!`,
        },
        { status: 403 }
      );
    }

    const toProfile = await prisma.profile.findUnique({
      where: { id: body.toProfileId },
      include: { user: true },
    });

    if (!toProfile) {
      return NextResponse.json(
        { error: "Perfil destinatário não encontrado" },
        { status: 404 }
      );
    }

    if (toProfile.userId === user.id) {
      return NextResponse.json(
        { error: "Não é possível enviar proposta para si mesmo" },
        { status: 400 }
      );
    }

    const proposal = await prisma.$transaction(async (tx) => {
      const created = await tx.proposal.create({
        data: {
          fromProfileId: dbUser.activeProfileId!,
          toProfileId: body.toProfileId,
          fromUserId: user.id,
          toUserId: toProfile.userId,
          eventDate: new Date(body.eventDate),
          message: body.message,
          amount: body.amount,
        },
        include: {
          fromProfile: true,
          toProfile: true,
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { proposalsUsed: { increment: 1 } },
      });

      await tx.notification.create({
        data: {
          userId: toProfile.userId,
          type: "proposal_received",
          title: "Nova proposta recebida",
          body: `${user.name} enviou uma proposta de R$ ${body.amount.toFixed(2)}`,
          proposalId: created.id,
        },
      });

      return created;
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
