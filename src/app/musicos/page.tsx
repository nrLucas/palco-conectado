'use client';

import { Button, Card, Chip, Input, Label, TextField } from '@heroui/react';
import { useSearchMusicians } from '@/lib/hooks';
import { MapPin, Star } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function MusiciansPage() {
  const [query, setQuery] = useState('');
  const { data: musicians, isLoading } = useSearchMusicians({ query });

  return (
    <main className="container mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Encontre Músicos Independentes</h1>
        <p className="text-muted mt-2 max-w-[65ch] text-sm leading-relaxed">
          Bateristas, guitarristas e vocalistas prontos para sua banda ou gig.
        </p>
      </header>

      <TextField className="mb-8 max-w-md">
        <Label className="sr-only">Buscar músicos</Label>
        <Input
          placeholder="Buscar por instrumento, nome ou estilo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </TextField>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-64 rounded-[var(--radius)] bg-default/50" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {musicians.length === 0 ? (
            <p className="col-span-full rounded-[var(--radius)] border border-dashed border-border px-6 py-16 text-center text-muted">
              Nenhum músico encontrado. Experimente buscar por outro termo.
            </p>
          ) : (
            musicians.map((musician) => (
              <Card key={musician.id} className="border border-border shadow-none transition-colors hover:border-accent/40">
                <Card.Header>
                  <Card.Title className="flex items-center justify-between text-lg">
                    <span>{musician.name}</span>
                    <Chip variant="secondary" className="gap-1">
                      <Star className="h-3 w-3 fill-accent text-accent" />
                      {musician.rating}
                    </Chip>
                  </Card.Title>
                </Card.Header>
                <Card.Content className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {musician.instruments.map((inst) => (
                      <Chip key={inst} variant="secondary" size="sm">
                        {inst}
                      </Chip>
                    ))}
                  </div>
                  <div className="text-sm text-muted flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {musician.location}
                  </div>
                  <p className="text-sm line-clamp-2">{musician.bio}</p>
                </Card.Content>
                <Card.Footer>
                  <Link href={`/musico/${musician.id}`} className="w-full">
                    <Button className="w-full" variant="secondary">Ver perfil</Button>
                  </Link>
                </Card.Footer>
              </Card>
            ))
          )}
        </div>
      )}
    </main>
  );
}
