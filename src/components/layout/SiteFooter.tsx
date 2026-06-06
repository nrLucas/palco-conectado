"use client";

import { EncryptedText } from "@/components/aceternity/encrypted-text";
import { useAuth } from "@/lib/auth";
import { AMBITIONS_TECH_URL } from "@/lib/constants";
import { Guitar } from "lucide-react";
import Link from "next/link";

const productLinks = [
  { href: "/como-funciona", label: "Como funciona" },
  { href: "/bandas", label: "Bandas" },
  { href: "/estabelecimentos", label: "Estabelecimentos" },
  { href: "/musicos", label: "Músicos" },
] as const;

const legalLinks = [
  { href: "#", label: "Termos de uso" },
  { href: "#", label: "Privacidade" },
] as const;

export function SiteFooter() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Guitar className="h-5 w-5 text-accent" aria-hidden />
              <span className="font-display text-lg font-bold">Palco Conectado</span>
            </Link>
            <p className="text-muted max-w-xs text-sm leading-relaxed">
              Marketplace de shows ao vivo. Conecte bandas, músicos e estabelecimentos em um só
              palco digital.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">Produto</h3>
            <ul className="space-y-2">
              {productLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-muted hover:text-foreground text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">Conta</h3>
            <ul className="space-y-2">
              {isAuthenticated ? (
                <li>
                  <Link
                    href="/propostas"
                    className="text-muted hover:text-foreground text-sm transition-colors"
                  >
                    Minhas propostas
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <button
                      type="button"
                      onClick={() => openAuthModal("login")}
                      className="text-muted hover:text-foreground text-sm transition-colors"
                    >
                      Entrar
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => openAuthModal("signup")}
                      className="text-muted hover:text-foreground text-sm transition-colors"
                    >
                      Criar conta
                    </button>
                  </li>
                </>
              )}
              <li>
                <Link
                  href="/assinatura"
                  className="text-muted hover:text-foreground text-sm transition-colors"
                >
                  Assinatura
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-muted hover:text-foreground text-sm transition-colors"
                    aria-label={label}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-muted text-sm">© {year} Palco Conectado. Todos os direitos reservados.</p>
          <a
            href={AMBITIONS_TECH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-accent text-sm transition-colors"
            aria-label="Ambitions Tech — desenvolvido por"
          >
            <EncryptedText
              text="Ambitions Tech"
              revealDelayMs={40}
              flipDelayMs={40}
              encryptedClassName="text-muted/60"
              revealedClassName="text-accent"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
