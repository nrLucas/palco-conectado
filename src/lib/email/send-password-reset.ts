import { Resend } from "resend";

interface SendPasswordResetParams {
  to: string;
  resetUrl: string;
  name: string;
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  name,
}: SendPasswordResetParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Palco Conectado <onboarding@resend.dev>";

  if (!apiKey || process.env.NODE_ENV !== "production") {
    console.log("\n[Palco Conectado] Link de redefinição de senha:");
    console.log(`  Para: ${to}`);
    console.log(`  Link: ${resetUrl}\n`);
    return;
  }

  const resend = new Resend(apiKey);

  await resend.emails.send({
    from,
    to,
    subject: "Redefinir sua senha — Palco Conectado",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 20px;">Olá, ${name}</h1>
        <p>Recebemos um pedido para redefinir a senha da sua conta no Palco Conectado.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #d97706; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Redefinir senha
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">Este link expira em 1 hora. Se você não solicitou, ignore este e-mail.</p>
        <p style="color: #999; font-size: 12px; word-break: break-all;">${resetUrl}</p>
      </div>
    `,
  });
}
