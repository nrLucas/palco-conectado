"use client";

import { Building2, FlaskConical, Guitar, Menu, Music2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { useAuth } from "@/lib/auth";
import { NotificationBell } from "./NotificationBell";
import { ProfileSwitcher } from "./ProfileSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

const navLinks: Array<{
  href: string;
  label: string;
  icon?: typeof Music2;
}> = [
  { href: "/como-funciona", label: "Como funciona?" },
  { href: "/bandas", label: "Bandas", icon: Music2 },
  { href: "/estabelecimentos", label: "Estabelecimentos", icon: Building2 },
  { href: "/musicos", label: "Músicos", icon: Guitar },
  { href: "/ml", label: "Laboratório", icon: FlaskConical },
];

export const SiteHeader = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) return;

    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const getNavCls = (path: string) => {
    const current = path === "/ml" ? pathname === "/ml" || pathname.startsWith("/ml/") : pathname === path;
    return current
      ? "text-accent font-medium"
      : "text-foreground/75 hover:text-foreground transition-colors";
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        isHome
          ? scrolled
            ? "border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
            : "border-b border-transparent bg-transparent"
          : "border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60",
      )}
    >
      <nav className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Guitar className="h-5 w-5 text-accent" aria-hidden />
          <span className="font-display text-lg font-bold tracking-tight">Palco Conectado</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={getNavCls(href)}>
              <span className="inline-flex items-center gap-2 text-sm">
                {Icon && <Icon className="h-4 w-4" />} {label}
              </span>
            </Link>
          ))}
          {isAuthenticated && (
            <Link href="/propostas" className={`text-sm ${getNavCls("/propostas")}`}>
              Propostas
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {isAuthenticated && <NotificationBell />}
          <ProfileSwitcher />
          {!isAuthenticated && (
            <Button
              className="button--hero hidden sm:inline-flex"
              onPress={() => openAuthModal("signup")}
            >
              Começar grátis
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            aria-label="Abrir menu"
            onPress={() => setMobileOpen((o) => !o)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={getNavCls(href)}
                onClick={() => setMobileOpen(false)}
              >
                <span className="inline-flex items-center gap-2 py-1">
                  {Icon && <Icon className="h-4 w-4" />} {label}
                </span>
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                href="/propostas"
                className={getNavCls("/propostas")}
                onClick={() => setMobileOpen(false)}
              >
                Propostas
              </Link>
            )}
            {!isAuthenticated && (
              <Button
                className="button--hero w-full"
                onPress={() => {
                  setMobileOpen(false);
                  openAuthModal("signup");
                }}
              >
                Começar grátis
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
