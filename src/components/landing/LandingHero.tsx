"use client";

import {
  GridBackground,
  Spotlight,
  TextGenerateEffect,
} from "@/components/aceternity";
import { Button, SearchField } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LandingHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    router.push(query ? `/bandas?query=${encodeURIComponent(query)}` : "/bandas");
  };

  return (
    <section
      aria-labelledby="hero-heading"
      className="group/spotlight relative min-h-[85vh] overflow-hidden border-b border-border"
    >
      <GridBackground className="absolute inset-0">
        <Spotlight fill="oklch(0.78 0.14 72 / 0.15)" />
      </GridBackground>

      <div className="relative z-10 container mx-auto flex min-h-[85vh] flex-col items-center justify-center px-4 py-24 text-center">
        <p className="text-accent mb-6 inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
          Marketplace de shows ao vivo
        </p>

        <h1
          id="hero-heading"
          className="font-display mb-6 max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl"
        >
          <TextGenerateEffect
            words="O palco certo encontra quem faz acontecer"
            className="text-foreground"
            duration={0.4}
          />
        </h1>

        <p className="text-muted mx-auto mb-10 max-w-2xl text-lg md:text-xl">
          Descubra artistas, negocie propostas e confirme reservas com avaliações reais — tudo em
          um marketplace feito para música ao vivo.
        </p>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/bandas">
            <Button className="button--hero px-8">Explorar bandas</Button>
          </Link>
          <Link href="/como-funciona">
            <Button variant="secondary" className="px-8">
              Como funciona
            </Button>
          </Link>
        </div>

        <div className="flex w-full max-w-lg gap-2">
          <SearchField className="flex-1" value={query} onChange={setQuery} aria-label="Busca rápida">
            <SearchField.Input placeholder="Busque por banda, estilo ou cidade" />
          </SearchField>
          <Button className="button--hero shrink-0" onPress={handleSearch}>
            Buscar
          </Button>
        </div>
      </div>
    </section>
  );
}
