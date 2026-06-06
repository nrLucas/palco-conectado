'use client';

import { Button, Card, Chip, Input, Label, TextField } from '@heroui/react';
import { useSearchMusicians } from '@/lib/hooks';
import { MapPin, Star } from 'lucide-react';
import { useState } from 'react';

export default function MusiciansPage() {
  const [query, setQuery] = useState('');
  const { data: musicians, isLoading } = useSearchMusicians({ query });

  return (
    <main className="container mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold">Encontre Músicos Independentes</h1>
        <p className="text-muted mt-1">
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
            <div key={i} className="animate-pulse h-64 rounded-xl bg-default/50" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {musicians.length === 0 ? (
            <p className="col-span-full text-center text-muted py-12">
              Nenhum músico encontrado. Experimente buscar por outro termo.
            </p>
          ) : (
            musicians.map((musician) => (
              <Card key={musician.id} className="shadow-surface hover:shadow-overlay transition-shadow">
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
                  <Button className="w-full">Ver Perfil</Button>
                </Card.Footer>
              </Card>
            ))
          )}
        </div>
      )}
    </main>
  );
}
