'use client';

import { SimilarProfiles } from '@/components/ml/SimilarProfiles';
import { ProposalModal } from '@/components/proposals/ProposalModal';
import { useProposalAction } from '@/components/proposals/useProposalAction';
import { Button, Card, Chip } from '@heroui/react';
import { useMusician } from '@/lib/hooks';
import { MapPin, Music2, Star } from 'lucide-react';
import { useParams } from 'next/navigation';

const EXPERIENCE_LABEL = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  profissional: 'Profissional',
} as const;

export default function MusicianProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: musician, isLoading } = useMusician(id);
  const { openProposal, modalOpen, setModalOpen, target } = useProposalAction();

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-10">
        <div className="animate-pulse h-64 bg-default/50 rounded-xl" />
      </main>
    );
  }

  if (!musician) {
    return (
      <main className="container mx-auto px-4 py-10">
        <p className="text-muted">Músico não encontrado.</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <h1 className="font-display text-3xl font-bold md:text-4xl">{musician.name}</h1>
          <div className="flex flex-wrap gap-2">
            {musician.genres.map((genre) => (
              <Chip key={genre} variant="soft" color="accent">
                <Music2 className="mr-1 h-3.5 w-3.5" />
                {genre}
              </Chip>
            ))}
            <Chip variant="secondary">
              <MapPin className="mr-1 h-3.5 w-3.5" />
              {musician.location}
            </Chip>
            <Chip variant="secondary">
              <Star className="mr-1 h-3.5 w-3.5 fill-accent text-accent" />
              {musician.rating} · {musician.totalGigs} gigs
            </Chip>
          </div>
          {musician.pricePerGig && <p className="text-muted text-sm">{musician.pricePerGig}</p>}
        </div>
        <Button
          className="button--hero shrink-0"
          isDisabled={!musician.profileId}
          onPress={() =>
            openProposal({ profileId: musician.profileId, targetName: musician.name })
          }
        >
          Enviar proposta
        </Button>
      </header>

      <section className="mt-8">
        <Card className="shadow-surface">
          <Card.Content className="space-y-6">
            <div>
              <h2 className="font-display mb-2 text-lg font-semibold">Sobre</h2>
              <p className="text-muted leading-relaxed">
                {musician.bio || 'Sem descrição cadastrada.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {musician.instruments.map((instrument) => (
                <Chip key={instrument} variant="secondary" size="sm">
                  {instrument}
                </Chip>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border bg-surface/50 p-4">
                <p className="text-muted text-xs uppercase tracking-wide">Experiência</p>
                <p className="mt-1 font-medium">{EXPERIENCE_LABEL[musician.experience]}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface/50 p-4">
                <p className="text-muted text-xs uppercase tracking-wide">Cidade-base</p>
                <p className="mt-1 font-medium">{musician.location}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface/50 p-4">
                <p className="text-muted text-xs uppercase tracking-wide">Gigs</p>
                <p className="mt-1 font-medium">{musician.totalGigs}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface/50 p-4">
                <p className="text-muted text-xs uppercase tracking-wide">Faixa de preço</p>
                <p className="mt-1 font-medium">{musician.pricePerGig || 'Sob consulta'}</p>
              </div>
            </div>
          </Card.Content>
        </Card>
        <SimilarProfiles kind="musician" id={musician.id} />
      </section>

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
