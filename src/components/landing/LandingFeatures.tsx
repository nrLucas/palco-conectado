"use client";

import { Building2, Guitar, Music2 } from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "Contratante",
    description: "Busque bandas, filtre e envie propostas.",
    icon: Building2,
    href: "/bandas",
  },
  {
    title: "Banda",
    description: "Perfil, portfólio e propostas recebidas.",
    icon: Music2,
    href: "/estabelecimentos",
  },
  {
    title: "Músico",
    description: "Instrumentos, disponibilidade e gigs.",
    icon: Guitar,
    href: "/musicos",
  },
] as const;

export function LandingFeatures() {
  return (
    <section className="container mx-auto px-4 py-12" aria-labelledby="features-heading">
      <div className="mx-auto max-w-3xl text-center">
        <h2 id="features-heading" className="font-display mb-2 text-3xl font-bold md:text-4xl">
          Para quem é o Palco Conectado?
        </h2>
        <p className="text-muted text-base md:text-lg">
          Três perfis, um palco digital.
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3">
        {features.map(({ title, description, icon: Icon, href }) => (
          <Link
            key={title}
            href={href}
            className="group flex items-start gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:border-accent/30 hover:shadow-overlay"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent/15">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="font-display font-semibold leading-tight">{title}</p>
              <p className="text-muted mt-0.5 text-sm leading-snug">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
