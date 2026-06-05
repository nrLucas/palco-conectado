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
  genre: z.string().min(2).optional(),
  description: z.string().optional(),
  location: z.string().min(3).optional(),
  members: z.number().min(1).optional(),
  priceRange: z.string().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const band = await prisma.band.findUnique({ where: { id } });

    if (!band) {
      return NextResponse.json({ error: "Banda não encontrada" }, { status: 404 });
    }

    const profile = await prisma.profile.findFirst({
      where: { entityId: id, type: "banda" },
    });

    return NextResponse.json({ ...band, profileId: profile?.id });
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

    const band = await prisma.band.findUnique({ where: { id } });
    if (!band) {
      return NextResponse.json({ error: "Banda não encontrada" }, { status: 404 });
    }

    assertOwner(user.id, band.userId);

    const updated = await prisma.band.update({
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

    const band = await prisma.band.findUnique({ where: { id } });
    if (!band) {
      return NextResponse.json({ error: "Banda não encontrada" }, { status: 404 });
    }

    assertOwner(user.id, band.userId);

    await prisma.$transaction([
      prisma.profile.deleteMany({ where: { entityId: id, type: "banda" } }),
      prisma.band.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
