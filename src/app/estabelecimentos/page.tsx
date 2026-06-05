'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEstablishments } from "@/lib/hooks";
import { useAuth } from "@/lib/auth";
import { Building2, Heart, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function EstablishmentsPage() {
  const { openAuthModal, isAuthenticated } = useAuth();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string>("todas");
  const [minCapacity, setMinCapacity] = useState<number>(0);

  const { data: establishments = [], isLoading } = useEstablishments({
    query: query || undefined,
    location: city !== "todas" ? city : undefined,
  });

  const cities = useMemo(
    () => Array.from(new Set(establishments.map((v) => v.location))).sort(),
    [establishments]
  );

  const filtered = establishments.filter((v) => v.capacity >= minCapacity);

  const handleAction = () => {
    if (!isAuthenticated) openAuthModal('login');
  };

  return (
    <main className="container mx-auto py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Encontre Bares e Restaurantes</h1>
        <p className="text-muted-foreground">Busque por cidade, capacidade e cache oferecido.</p>
      </header>

      <section className="mb-6 grid gap-3 md:grid-cols-4" aria-label="Filtros">
        <div className="md:col-span-2">
          <Input placeholder="Buscar por nome ou cidade" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger><SelectValue placeholder="Cidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as cidades</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(minCapacity)} onValueChange={(v) => setMinCapacity(Number(v))}>
          <SelectTrigger><SelectValue placeholder="Capacidade" /></SelectTrigger>
          <SelectContent>
            {[0, 100, 150, 200].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n === 0 ? "Qualquer capacidade" : `A partir de ${n}`}
              </SelectItem>
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
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <Card key={v.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2">
                    <Building2 className="h-5 w-5" /> {v.name}
                  </span>
                  <Badge variant="secondary">
                    <Star className="h-4 w-4 text-primary" /> {v.rating}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {v.location}
                </p>
                <p className="mt-2 text-sm">
                  {v.averageBudget || "Consulte"} • Capacidade {v.capacity}
                </p>
              </CardContent>
              <CardFooter className="flex gap-2 flex-wrap">
                <Link href={`/estabelecimento/${v.id}`}>
                  <Button variant="secondary">Ver perfil</Button>
                </Link>
                <Button onClick={handleAction}>Criar vaga</Button>
                <Button variant="outline" onClick={handleAction}>
                  <Heart className="mr-2 h-4 w-4" /> Favoritar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
}
