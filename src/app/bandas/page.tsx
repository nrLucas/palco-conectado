'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBands } from "@/lib/hooks";
import { useAuth } from "@/lib/auth";
import { Heart, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function BandasPage() {
  const { openAuthModal, isAuthenticated } = useAuth();
  const [query, setQuery] = useState("");
  const [style, setStyle] = useState<string>("todas");
  const [city, setCity] = useState<string>("todas");
  const [minRating, setMinRating] = useState<number>(0);

  const { data: bands = [], isLoading } = useBands({
    query: query || undefined,
    location: city !== "todas" ? city : undefined,
    genre: style !== "todas" ? style : undefined,
    minRating: minRating || undefined,
  });

  const styles = useMemo(
    () => Array.from(new Set(bands.map((b) => b.genre))).sort(),
    [bands]
  );
  const cities = useMemo(
    () => Array.from(new Set(bands.map((b) => b.location))).sort(),
    [bands]
  );

  const handleAction = (action: string) => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
  };

  return (
    <main className="container mx-auto py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Encontre Bandas e Cantores</h1>
        <p className="text-muted-foreground">Filtre por estilo, cidade, nome e nota mínima.</p>
      </header>

      <section className="mb-6 grid gap-3 md:grid-cols-4" aria-label="Filtros">
        <div className="md:col-span-2">
          <Input placeholder="Buscar por nome ou cidade" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Buscar" />
        </div>
        <Select value={style} onValueChange={setStyle}>
          <SelectTrigger aria-label="Estilo"><SelectValue placeholder="Estilo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos os estilos</SelectItem>
            {styles.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger aria-label="Cidade"><SelectValue placeholder="Cidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as cidades</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(minRating)} onValueChange={(v) => setMinRating(Number(v))}>
          <SelectTrigger aria-label="Nota mínima"><SelectValue placeholder="Nota mínima" /></SelectTrigger>
          <SelectContent>
            {[0, 3, 4, 4.5].map((n) => (
              <SelectItem key={n} value={String(n)}>{n === 0 ? "Qualquer nota" : `A partir de ${n}`}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse h-64 bg-muted/50" />
          ))}
        </div>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Lista de bandas">
          {bands.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-12">
              Nenhuma banda encontrada.
            </p>
          ) : (
            bands.map((b) => (
              <Card key={b.id} className="group relative overflow-hidden rounded-xl border border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{b.name}</span>
                    <Badge variant="secondary" className="inline-flex items-center gap-1">
                      <Star className="h-4 w-4 text-primary" /> {b.rating}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {b.location}
                  </p>
                  <p className="mt-2 text-sm">
                    {b.priceRange || "Consulte"} • {b.members} integrantes
                  </p>
                  <div className="mt-3">
                    <span className="rounded bg-accent px-2 py-0.5 text-xs">{b.genre}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 flex-wrap">
                  <Link href={`/banda/${b.id}`}>
                    <Button variant="secondary">Ver perfil</Button>
                  </Link>
                  <Button onClick={() => handleAction('enviar-proposta')}>Enviar proposta</Button>
                  <Button variant="outline" onClick={() => handleAction('favoritar')}>
                    <Heart className="mr-2 h-4 w-4" /> Favoritar
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </section>
      )}
    </main>
  );
}
