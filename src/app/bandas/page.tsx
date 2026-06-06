'use client';

import { FilterSelect } from '@/components/shared/FilterSelect';
import { Button, Card, Chip, Input, Label, TextField } from '@heroui/react';
import { useBands } from '@/lib/hooks';
import { useAuth } from '@/lib/auth';
import { Heart, MapPin, Star } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export default function BandasPage() {
  const { openAuthModal, isAuthenticated } = useAuth();
  const [query, setQuery] = useState('');
  const [style, setStyle] = useState<string>('todas');
  const [city, setCity] = useState<string>('todas');
  const [minRating, setMinRating] = useState<number>(0);

  const { data: bands = [], isLoading } = useBands({
    query: query || undefined,
    location: city !== 'todas' ? city : undefined,
    genre: style !== 'todas' ? style : undefined,
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

  const handleAction = () => {
    if (!isAuthenticated) openAuthModal('login');
  };

  return (
    <main className="container mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold">Encontre Bandas e Cantores</h1>
        <p className="text-muted mt-1">Filtre por estilo, cidade, nome e nota mínima.</p>
      </header>

      <section className="mb-8 grid gap-3 md:grid-cols-4" aria-label="Filtros">
        <TextField className="md:col-span-2">
          <Label className="sr-only">Buscar</Label>
          <Input
            placeholder="Buscar por nome ou cidade"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar"
          />
        </TextField>
        <FilterSelect
          label="Estilo"
          value={style}
          onChange={setStyle}
          options={[
            { id: 'todas', label: 'Todos os estilos' },
            ...styles.map((s) => ({ id: s, label: s })),
          ]}
        />
        <FilterSelect
          label="Cidade"
          value={city}
          onChange={setCity}
          options={[
            { id: 'todas', label: 'Todas as cidades' },
            ...cities.map((c) => ({ id: c, label: c })),
          ]}
        />
        <FilterSelect
          label="Nota mínima"
          value={String(minRating)}
          onChange={(v) => setMinRating(Number(v))}
          options={[0, 3, 4, 4.5].map((n) => ({
            id: String(n),
            label: n === 0 ? 'Qualquer nota' : `A partir de ${n}`,
          }))}
        />
      </section>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-64 rounded-xl bg-default/50" />
          ))}
        </div>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Lista de bandas">
          {bands.length === 0 ? (
            <p className="col-span-full text-center text-muted py-12">Nenhuma banda encontrada.</p>
          ) : (
            bands.map((b) => (
              <Card key={b.id} className="border-accent/15 shadow-surface hover:shadow-overlay transition-shadow">
                <Card.Header>
                  <Card.Title className="flex items-center justify-between text-lg">
                    <span>{b.name}</span>
                    <Chip variant="secondary" className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-accent text-accent" /> {b.rating}
                    </Chip>
                  </Card.Title>
                </Card.Header>
                <Card.Content>
                  <p className="text-sm text-muted inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {b.location}
                  </p>
                  <p className="mt-2 text-sm">
                    {b.priceRange || 'Consulte'} • {b.members} integrantes
                  </p>
                  <Chip className="mt-3" variant="soft" color="accent">
                    {b.genre}
                  </Chip>
                </Card.Content>
                <Card.Footer className="flex gap-2 flex-wrap">
                  <Link href={`/banda/${b.id}`}>
                    <Button variant="secondary">Ver perfil</Button>
                  </Link>
                  <Button onPress={handleAction}>Enviar proposta</Button>
                  <Button variant="outline" onPress={handleAction}>
                    <Heart className="mr-2 h-4 w-4" /> Favoritar
                  </Button>
                </Card.Footer>
              </Card>
            ))
          )}
        </section>
      )}
    </main>
  );
}
