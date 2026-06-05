import { prisma } from "@/lib/db";
import {
  assertAuthenticated,
  handleApiError,
} from "@/lib/auth/permissions";
import { NextResponse } from "next/server";
import { z } from "zod";
const patchSchema = z.object({
  profileId: z.string(),
});

export async function PATCH(request: Request) {
  try {
    const user = await assertAuthenticated();
    const { profileId } = patchSchema.parse(await request.json());

    const profile = await prisma.profile.findFirst({
      where: { id: profileId, userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { activeProfileId: profileId },
    });

    return NextResponse.json({ activeProfileId: profileId });
  } catch (error) {
    return handleApiError(error);
  }
}
