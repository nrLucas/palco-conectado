import { consumeResetToken, verifyResetToken } from "@/lib/auth/reset-token";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { NextResponse } from "next/server";
import { z } from "zod";

const resetPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
  token: z.string().min(1, "Token inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Dados inválidos" },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const { token, password } = parsed.data;

    const valid = await verifyResetToken(email, token);
    if (!valid) {
      return NextResponse.json(
        { error: "Link inválido ou expirado" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Link inválido ou expirado" },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await consumeResetToken(email);

    return NextResponse.json({ message: "Senha redefinida com sucesso" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao redefinir senha" }, { status: 500 });
  }
}
