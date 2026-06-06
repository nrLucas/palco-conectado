import type { NextAuthConfig } from "next-auth";

/**
 * Config mínima compartilhada (proxy + auth completo).
 * Não importar Prisma, bcrypt ou adapters aqui.
 */
export const authConfig = {
  providers: [],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  trustHost: true,
} satisfies NextAuthConfig;
