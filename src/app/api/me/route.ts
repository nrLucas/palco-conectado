import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/auth/permissions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profiles: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const activeProfile = user.profiles.find(
      (p) => p.id === user.activeProfileId
    );

    let activeEntity = null;
    if (activeProfile) {
      activeEntity = await resolveEntity(activeProfile.type, activeProfile.entityId);
    }

    const profilesWithEntities = await Promise.all(
      user.profiles.map(async (profile) => ({
        id: profile.id,
        type: profile.type,
        entityId: profile.entityId,
        role: profile.role,
        createdAt: profile.createdAt.toISOString(),
        entity: await resolveEntity(profile.type, profile.entityId),
      }))
    );

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.image,
      activeProfileId: user.activeProfileId,
      subscription: {
        tier: user.subscriptionTier,
        features: [],
      },
      proposalsUsed: user.proposalsUsed,
      proposalsLimit: user.proposalsLimit,
      lastLoginAt: user.updatedAt.toISOString(),
      createdAt: user.createdAt.toISOString(),
      password: "",
      profiles: profilesWithEntities.map(({ entity, ...p }) => ({
        ...p,
        entityName: (entity as { name?: string } | null)?.name ?? "Perfil",
      })),
      activeProfile: activeProfile
        ? {
            id: activeProfile.id,
            type: activeProfile.type,
            entityId: activeProfile.entityId,
            role: activeProfile.role,
            createdAt: activeProfile.createdAt.toISOString(),
          }
        : null,
      activeEntity,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

async function resolveEntity(type: string, entityId: string) {
  switch (type) {
    case "artista_independente":
      return prisma.musician.findUnique({ where: { id: entityId } });
    case "banda":
      return prisma.band.findUnique({ where: { id: entityId } });
    case "contratante":
      return prisma.establishment.findUnique({ where: { id: entityId } });
    default:
      return null;
  }
}
