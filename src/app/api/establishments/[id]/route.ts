import { prisma } from "@/lib/db";
import {
  assertAuthenticated,
  assertOwner,
  handleApiError,
} from "@/lib/auth/permissions";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  type: z.string().min(2).optional(),
  description: z.string().optional(),
  location: z.string().min(3).optional(),
  capacity: z.number().min(1).optional(),
  averageBudget: z.string().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const establishment = await prisma.establishment.findUnique({
      where: { id },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Estabelecimento não encontrado" },
        { status: 404 }
      );
    }

    const profile = await prisma.profile.findFirst({
      where: { entityId: id, type: "contratante" },
    });

    return NextResponse.json({ ...establishment, profileId: profile?.id });
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
    const body = updateSchema.parse(await request.json());

    const establishment = await prisma.establishment.findUnique({
      where: { id },
    });
    if (!establishment) {
      return NextResponse.json(
        { error: "Estabelecimento não encontrado" },
        { status: 404 }
      );
    }

    assertOwner(user.id, establishment.userId);

    const updated = await prisma.establishment.update({
      where: { id },
      data: body,
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

    const establishment = await prisma.establishment.findUnique({
      where: { id },
    });
    if (!establishment) {
      return NextResponse.json(
        { error: "Estabelecimento não encontrado" },
        { status: 404 }
      );
    }

    assertOwner(user.id, establishment.userId);

    await prisma.$transaction([
      prisma.profile.deleteMany({
        where: { entityId: id, type: "contratante" },
      }),
      prisma.establishment.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
