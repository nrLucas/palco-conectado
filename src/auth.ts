import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import type { SubscriptionTier } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      activeProfileId?: string | null;
      subscriptionTier: SubscriptionTier;
      proposalsUsed: number;
      proposalsLimit: number;
    };
  }

  interface User {
    activeProfileId?: string | null;
    subscriptionTier?: SubscriptionTier;
    proposalsUsed?: number;
    proposalsLimit?: number;
  }

  interface JWT {
    id: string;
    activeProfileId?: string | null;
    subscriptionTier: SubscriptionTier;
    proposalsUsed: number;
    proposalsLimit: number;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          activeProfileId: user.activeProfileId,
          subscriptionTier: user.subscriptionTier,
          proposalsUsed: user.proposalsUsed,
          proposalsLimit: user.proposalsLimit,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.activeProfileId = user.activeProfileId ?? null;
        token.subscriptionTier = user.subscriptionTier ?? "free";
        token.proposalsUsed = user.proposalsUsed ?? 0;
        token.proposalsLimit = user.proposalsLimit ?? 2;
      }

      if (trigger === "update" && session?.activeProfileId !== undefined) {
        token.activeProfileId = session.activeProfileId;
      }

      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            activeProfileId: true,
            subscriptionTier: true,
            proposalsUsed: true,
            proposalsLimit: true,
          },
        });
        if (dbUser) {
          token.activeProfileId = dbUser.activeProfileId;
          token.subscriptionTier = dbUser.subscriptionTier;
          token.proposalsUsed = dbUser.proposalsUsed;
          token.proposalsLimit = dbUser.proposalsLimit;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.activeProfileId = (token.activeProfileId as string | null) ?? null;
        session.user.subscriptionTier = token.subscriptionTier as SubscriptionTier;
        session.user.proposalsUsed = token.proposalsUsed as number;
        session.user.proposalsLimit = token.proposalsLimit as number;
      }
      return session;
    },
  },
});
