'use client';

import { FilterSelect } from '@/components/shared/FilterSelect';
import { ProposalModal } from '@/components/proposals/ProposalModal';
import { useProposalAction } from '@/components/proposals/useProposalAction';
import { Button, Card, Chip, Input, Label, TextField } from '@heroui/react';
import { useEstablishments } from '@/lib/hooks';
import { MapPin, Star, Users } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export default function EstabelecimentosPage() {
  const { openProposal, modalOpen, setModalOpen, target } = useProposalAction();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<string>('todos');
  const [city, setCity] = useState<string>('todas');

  const { data: establishments = [], isLoading } = useEstablishments({
    query: query || undefined,
    location: city !== 'todas' ? city : undefined,
    type: type !== 'todos' ? type : undefined,
  });

  const types = useMemo(
    () => Array.from(new Set(establishments.map((e) => e.type))).sort(),
    [establishments],
  );
  const cities = useMemo(
    () => Array.from(new Set(establishments.map((e) => e.location))).sort(),
    [establishments],
  );

  return (
    <main className="container mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Encontre Estabelecimentos</h1>
        <p className="text-muted mt-2 max-w-[65ch] text-sm leading-relaxed">Bares, restaurantes e casas de show abertos a contratações.</p>
      </header>

      <section className="mb-8 grid gap-3 md:grid-cols-4" aria-label="Filtros">
        <TextField className="md:col-span-2">
          <Label className="sr-only">Buscar</Label>
          <Input
            placeholder="Buscar por nome ou bairro"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </TextField>
        <FilterSelect
          label="Tipo"
          value={type}
          onChange={setType}
          options={[
            { id: 'todos', label: 'Todos os tipos' },
            ...types.map((t) => ({ id: t, label: t })),
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
      </section>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-64 rounded-[var(--radius)] bg-default/50" />
          ))}
        </div>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {establishments.length === 0 ? (
            <p className="col-span-full rounded-[var(--radius)] border border-dashed border-border px-6 py-16 text-center text-muted">
              Nenhum estabelecimento encontrado com esses filtros.
            </p>
          ) : (
            establishments.map((e) => (
              <Card
                key={e.id}
                className="border border-border shadow-none transition-colors hover:border-accent/40"
              >
                <Card.Header>
                  <Card.Title className="flex items-center justify-between text-lg">
                    <span>{e.name}</span>
                    <Chip variant="secondary" className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-accent text-accent" /> {e.rating}
                    </Chip>
                  </Card.Title>
                  <Card.Description className="capitalize">{e.type}</Card.Description>
                </Card.Header>
                <Card.Content>
                  <p className="text-sm text-muted inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {e.location}
                  </p>
                  <p className="mt-2 text-sm inline-flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted" /> Capacidade: {e.capacity}
                  </p>
                  {e.averageBudget && (
                    <Chip className="mt-3" variant="soft" color="accent">
                      {e.averageBudget}
                    </Chip>
                  )}
                </Card.Content>
                <Card.Footer className="flex gap-2">
                  <Link href={`/estabelecimento/${e.id}`} className="min-w-0 flex-1">
                    <Button variant="secondary" className="w-full">Ver perfil</Button>
                  </Link>
                  <Button
                    className="min-w-0 flex-1"
                    isDisabled={!e.profileId}
                    onPress={() =>
                      openProposal({ profileId: e.profileId, targetName: e.name })
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
