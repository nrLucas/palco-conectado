import { auth } from "@/auth";
import { NextResponse } from "next/server";

const publicPaths = [
  "/",
  "/bandas",
  "/musicos",
  "/estabelecimentos",
  "/assinatura",
];

const authPaths = ["/profile", "/propostas"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const isPublic =
    publicPaths.includes(pathname) ||
    pathname.startsWith("/banda/") ||
    pathname.startsWith("/estabelecimento/") ||
    pathname.startsWith("/api/auth") ||
    (pathname.startsWith("/api/bands") && req.method === "GET") ||
    (pathname.startsWith("/api/musicians") && req.method === "GET") ||
    (pathname.startsWith("/api/establishments") && req.method === "GET");

  if (isPublic) {
    return NextResponse.next();
  }

  const needsAuth =
    authPaths.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/api/proposals") ||
    pathname.startsWith("/api/notifications") ||
    pathname.startsWith("/api/profiles") ||
    pathname.startsWith("/api/me");

  if (needsAuth && !isLoggedIn) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("auth", "login");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
