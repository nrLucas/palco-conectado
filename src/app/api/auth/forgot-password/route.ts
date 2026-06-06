import {
  buildResetUrl,
  createResetToken,
} from "@/lib/auth/reset-token";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email/send-password-reset";
import { NextResponse } from "next/server";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

const GENERIC_MESSAGE =
  "Se o e-mail estiver cadastrado, você receberá um link em instantes.";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Dados inválidos" },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email },
      select: { email: true, name: true, passwordHash: true },
    });

    if (user?.passwordHash) {
      const rawToken = await createResetToken(email);
      const resetUrl = buildResetUrl(email, rawToken);

      await sendPasswordResetEmail({
        to: email,
        resetUrl,
        name: user.name,
      });
    }

    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: GENERIC_MESSAGE });
  }
}
