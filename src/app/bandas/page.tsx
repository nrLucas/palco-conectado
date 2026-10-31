'use client';

import { FilterSelect } from '@/components/shared/FilterSelect';
import { ProposalModal } from '@/components/proposals/ProposalModal';
import { useProposalAction } from '@/components/proposals/useProposalAction';
import { Button, Card, Chip, Input, Label, TextField } from '@heroui/react';
import { useBands } from '@/lib/hooks';
import { MapPin, Star } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export default function BandasPage() {
  const { openProposal, modalOpen, setModalOpen, target } = useProposalAction();
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
    [bands],
  );
  const cities = useMemo(
    () => Array.from(new Set(bands.map((b) => b.location))).sort(),
    [bands],
  );

  return (
    <main className="container mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Encontre Bandas e Cantores</h1>
        <p className="text-muted mt-2 max-w-[65ch] text-sm leading-relaxed">Filtre por estilo, cidade, nome e nota mínima.</p>
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
            <div key={i} className="animate-pulse h-64 rounded-[var(--radius)] bg-default/50" />
          ))}
        </div>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Lista de bandas">
          {bands.length === 0 ? (
            <p className="col-span-full rounded-[var(--radius)] border border-dashed border-border px-6 py-16 text-center text-muted">
              Nenhuma banda encontrada com esses filtros.
            </p>
          ) : (
            bands.map((b) => (
              <Card
                key={b.id}
                className="border border-border shadow-none transition-colors hover:border-accent/40"
              >
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
                <Card.Footer className="flex gap-2">
                  <Link href={`/banda/${b.id}`} className="min-w-0 flex-1">
                    <Button variant="secondary" className="w-full">Ver perfil</Button>
                  </Link>
                  <Button
                    className="min-w-0 flex-1"
                    isDisabled={!b.profileId}
                    onPress={() =>
                      openProposal({ profileId: b.profileId, targetName: b.name })
                    }
                  >
                    Enviar proposta
                  </Button>
                </Card.Footer>
              </Card>
            ))
          )}
        </section>
      )}

      {target && (
        <ProposalModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          toProfileId={target.toProfileId}
          targetName={target.targetName}
          onProposalSent={() => setModalOpen(false)}
        />
      )}
    </main>
  );
}
