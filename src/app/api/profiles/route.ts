import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  assertAuthenticated,
  handleApiError,
} from "@/lib/auth/permissions";
import type { ProfileType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const createProfileSchema = z.object({
  type: z.enum(["artista_independente", "banda", "contratante"]),
  musician: z
    .object({
      name: z.string().min(2),
      instruments: z.array(z.string()).min(1),
      genres: z.array(z.string()).min(1),
      experience: z.enum(["iniciante", "intermediario", "profissional"]),
      location: z.string().min(3),
      bio: z.string().optional(),
      availability: z.enum(["disponivel", "ocupado", "parcial"]).optional(),
      lookingFor: z.enum(["banda", "freelance", "ambos"]).optional(),
      pricePerGig: z.string().optional(),
    })
    .optional(),
  band: z
    .object({
      name: z.string().min(2),
      genre: z.string().min(2),
      description: z.string().optional(),
      location: z.string().min(3),
      members: z.number().min(1).optional(),
      priceRange: z.string().optional(),
    })
    .optional(),
  establishment: z
    .object({
      name: z.string().min(2),
      type: z.string().min(2),
      description: z.string().optional(),
      location: z.string().min(3),
      capacity: z.number().min(1).optional(),
      averageBudget: z.string().optional(),
    })
    .optional(),
});

export async function GET() {
  try {
    const user = await assertAuthenticated();
    const profiles = await prisma.profile.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(profiles);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await assertAuthenticated();
    const body = await request.json();
    const parsed = createProfileSchema.parse(body);

    const profileLimits: Record<string, number> = {
      free: 2,
      basic: 5,
      premium: 10,
      enterprise: 50,
    };
    const max =
      profileLimits[user.subscriptionTier ?? "free"] ?? 2;
    const current = await prisma.profile.count({
      where: { userId: user.id },
    });

    if (current >= max) {
      return NextResponse.json(
        { error: `Limite de ${max} perfis atingido` },
        { status: 403 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      let entityId: string;

      if (parsed.type === "artista_independente") {
        if (!parsed.musician) {
          throw new Error("Dados do músico são obrigatórios");
        }
        const m = parsed.musician;
        const musician = await tx.musician.create({
          data: {
            userId: user.id,
            name: m.name,
            instruments: m.instruments,
            genres: m.genres,
            experience: m.experience,
            location: m.location,
            bio: m.bio ?? "",
            availability: m.availability ?? "disponivel",
            lookingFor: m.lookingFor ?? "ambos",
            pricePerGig: m.pricePerGig,
          },
        });
        entityId = musician.id;
      } else if (parsed.type === "banda") {
        if (!parsed.band) {
          throw new Error("Dados da banda são obrigatórios");
        }
        const b = parsed.band;
        const band = await tx.band.create({
          data: {
            userId: user.id,
            name: b.name,
            genre: b.genre,
            description: b.description ?? "",
            location: b.location,
            members: b.members ?? 1,
            priceRange: b.priceRange ?? "",
          },
        });
        entityId = band.id;
      } else {
        if (!parsed.establishment) {
          throw new Error("Dados do estabelecimento são obrigatórios");
        }
        const e = parsed.establishment;
        const establishment = await tx.establishment.create({
          data: {
            userId: user.id,
            name: e.name,
            type: e.type,
            description: e.description ?? "",
            location: e.location,
            capacity: e.capacity ?? 50,
            averageBudget: e.averageBudget ?? "",
          },
        });
        entityId = establishment.id;
      }

      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          type: parsed.type as ProfileType,
          entityId,
        },
      });

      const dbUser = await tx.user.findUnique({ where: { id: user.id } });
      if (!dbUser?.activeProfileId) {
        await tx.user.update({
          where: { id: user.id },
          data: { activeProfileId: profile.id },
        });
      }

      return profile;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
