import { prisma } from "@/lib/db";
import {
  assertAuthenticated,
  handleApiError,
} from "@/lib/auth/permissions";
import { NextResponse } from "next/server";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["accepted", "rejected"]),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await assertAuthenticated();
    const { id } = await params;

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: { fromProfile: true, toProfile: true },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
    }

    if (proposal.fromUserId !== user.id && proposal.toUserId !== user.id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    return NextResponse.json(proposal);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await assertAuthenticated();
    const { id } = await params;
    const { status } = patchSchema.parse(await request.json());

    const proposal = await prisma.proposal.findUnique({ where: { id } });

    if (!proposal) {
      return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
    }

    if (proposal.toUserId !== user.id) {
      return NextResponse.json(
        { error: "Apenas o destinatário pode responder" },
        { status: 403 }
      );
    }

    if (proposal.status !== "pending") {
      return NextResponse.json(
        { error: "Proposta já foi respondida" },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.proposal.update({
        where: { id },
        data: { status },
        include: { fromProfile: true, toProfile: true },
      });

      const sender = await tx.user.findUnique({
        where: { id: proposal.fromUserId },
      });

      await tx.notification.create({
        data: {
          userId: proposal.fromUserId,
          type:
            status === "accepted"
              ? "proposal_accepted"
              : "proposal_rejected",
          title:
            status === "accepted"
              ? "Proposta aceita!"
              : "Proposta recusada",
          body: `Sua proposta foi ${status === "accepted" ? "aceita" : "recusada"}`,
          proposalId: id,
        },
      });

      return result;
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await assertAuthenticated();
    const { id } = await params;

    const proposal = await prisma.proposal.findUnique({ where: { id } });

    if (!proposal) {
      return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
    }

    if (proposal.fromUserId !== user.id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    if (proposal.status !== "pending") {
      return NextResponse.json(
        { error: "Apenas propostas pendentes podem ser canceladas" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.proposal.delete({ where: { id } });
      await tx.user.update({
        where: { id: user.id },
        data: { proposalsUsed: { decrement: 1 } },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
