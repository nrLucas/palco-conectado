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
  instruments: z.array(z.string()).optional(),
  genres: z.array(z.string()).optional(),
  experience: z.enum(["iniciante", "intermediario", "profissional"]).optional(),
  location: z.string().min(3).optional(),
  bio: z.string().optional(),
  availability: z.enum(["disponivel", "ocupado", "parcial"]).optional(),
  lookingFor: z.enum(["banda", "freelance", "ambos"]).optional(),
  pricePerGig: z.string().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const musician = await prisma.musician.findUnique({ where: { id } });

    if (!musician) {
      return NextResponse.json({ error: "Músico não encontrado" }, { status: 404 });
    }

    const profile = await prisma.profile.findFirst({
      where: { entityId: id, type: "artista_independente" },
    });

    return NextResponse.json({ ...musician, profileId: profile?.id });
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

    const musician = await prisma.musician.findUnique({ where: { id } });
    if (!musician) {
      return NextResponse.json({ error: "Músico não encontrado" }, { status: 404 });
    }

    assertOwner(user.id, musician.userId);

    const updated = await prisma.musician.update({
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

    const musician = await prisma.musician.findUnique({ where: { id } });
    if (!musician) {
      return NextResponse.json({ error: "Músico não encontrado" }, { status: 404 });
    }

    assertOwner(user.id, musician.userId);

    await prisma.$transaction([
      prisma.profile.deleteMany({
        where: { entityId: id, type: "artista_independente" },
      }),
      prisma.musician.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
