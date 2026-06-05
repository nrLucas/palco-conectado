import { prisma } from "@/lib/db";
import {
  assertAuthenticated,
  assertOwner,
  handleApiError,
} from "@/lib/auth/permissions";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await assertAuthenticated();
    const { id } = await params;

    const profile = await prisma.profile.findFirst({
      where: { id, userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    assertOwner(user.id, profile.userId);

    await prisma.$transaction(async (tx) => {
      if (profile.type === "artista_independente") {
        await tx.musician.deleteMany({
          where: { id: profile.entityId, userId: user.id },
        });
      } else if (profile.type === "banda") {
        await tx.band.deleteMany({
          where: { id: profile.entityId, userId: user.id },
        });
      } else {
        await tx.establishment.deleteMany({
          where: { id: profile.entityId, userId: user.id },
        });
      }

      await tx.profile.delete({ where: { id } });

      const remaining = await tx.profile.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          activeProfileId: remaining[0]?.id ?? null,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
