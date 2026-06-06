import { authConfig } from "@/auth.config";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

/** Páginas que exigem sessão — APIs são protegidas nas route handlers. */
const protectedPages = ["/profile", "/propostas"];

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtectedPage = protectedPages.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (isProtectedPage && !req.auth) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("auth", "login");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/profile", "/profile/:path*", "/propostas", "/propostas/:path*"],
};
