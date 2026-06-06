import { prisma } from "@/lib/db";
import { createHash, randomBytes, timingSafeEqual } from "crypto";

const RESET_PREFIX = "password-reset:";
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function resetIdentifier(email: string): string {
  return `${RESET_PREFIX}${email.toLowerCase().trim()}`;
}

export async function createResetToken(email: string): Promise<string> {
  const identifier = resetIdentifier(email);
  const rawToken = randomBytes(32).toString("hex");
  const hashed = hashToken(rawToken);
  const expires = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  await prisma.verificationToken.create({
    data: {
      identifier,
      token: hashed,
      expires,
    },
  });

  return rawToken;
}

export async function verifyResetToken(
  email: string,
  rawToken: string,
): Promise<boolean> {
  const identifier = resetIdentifier(email);
  const record = await prisma.verificationToken.findFirst({
    where: { identifier },
  });

  if (!record || record.expires < new Date()) {
    return false;
  }

  const incoming = Buffer.from(hashToken(rawToken), "utf8");
  const stored = Buffer.from(record.token, "utf8");

  if (incoming.length !== stored.length) {
    return false;
  }

  return timingSafeEqual(incoming, stored);
}

export async function consumeResetToken(email: string): Promise<void> {
  await prisma.verificationToken.deleteMany({
    where: { identifier: resetIdentifier(email) },
  });
}

export function buildResetUrl(email: string, rawToken: string): string {
  const base = process.env.AUTH_URL ?? "http://localhost:3000";
  const params = new URLSearchParams({
    token: rawToken,
    email,
  });
  return `${base}/redefinir-senha?${params.toString()}`;
}
