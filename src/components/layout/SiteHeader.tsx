"use client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Building2, Guitar, Music2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationBell } from "./NotificationBell";
import { ProfileSwitcher } from "./ProfileSwitcher";

export const SiteHeader = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const pathname = usePathname();

  const getNavCls = (path: string) =>
    pathname === path ? "text-primary" : "text-foreground/80 hover:text-foreground";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Guitar className="h-5 w-5 text-primary" aria-hidden />
          <span className="font-semibold">Palco Conectado</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/bandas" className={getNavCls('/bandas')}>
            <span className="inline-flex items-center gap-2">
              <Music2 className="h-4 w-4" /> Bandas
            </span>
          </Link>
          <Link href="/estabelecimentos" className={getNavCls('/estabelecimentos')}>
            <span className="inline-flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Estabelecimentos
            </span>
          </Link>
          <Link href="/musicos" className={getNavCls('/musicos')}>
            <span className="inline-flex items-center gap-2">
              <Guitar className="h-4 w-4" /> Músicos
            </span>
          </Link>
          {isAuthenticated && (
            <Link href="/propostas" className={getNavCls('/propostas')}>
              Propostas
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && <NotificationBell />}
          <ProfileSwitcher />
          {!isAuthenticated && (
            <Button variant="hero" onClick={() => openAuthModal('signup')}>
              Criar Conta
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
};
