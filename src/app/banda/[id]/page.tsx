'use client';

import HeroImage from '@/assets/hero-music.jpg';
import { Recommendations } from '@/components/ml/Recommendations';
import { SimilarProfiles } from '@/components/ml/SimilarProfiles';
import { ProposalModal } from '@/components/proposals/ProposalModal';
import { useProposalAction } from '@/components/proposals/useProposalAction';
import { Button, Card, Chip, Tabs } from '@heroui/react';
import { useBand } from '@/lib/hooks';
import { MapPin, Music2, Star, Users } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

export default function BandProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: band, isLoading } = useBand(id);
  const { openProposal, modalOpen, setModalOpen, target } = useProposalAction();

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-10">
        <div className="h-64 animate-pulse rounded-[var(--radius)] bg-default/50" />
      </main>
    );
  }

  if (!band) {
    return (
      <main className="container mx-auto px-4 py-10">
        <p className="text-muted">Banda não encontrada.</p>
      </main>
    );
  }

  const coverSrc = band.image || HeroImage;

  return (
    <main>
      <header className="relative h-64 w-full">
        <Image
          src={coverSrc}
          alt={`Capa de ${band.name}`}
          fill
          className="object-cover"
          unoptimized={!!band.image}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
        <div className="container mx-auto absolute bottom-4 left-0 right-0 flex flex-col gap-4 px-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="font-display relative z-10 text-2xl font-semibold tracking-tight text-foreground">
              {band.name}
            </h1>
            <div className="relative z-10 flex flex-wrap gap-2">
              <Chip variant="soft" color="accent">
                <Music2 className="mr-1 h-3.5 w-3.5" />
                {band.genre}
              </Chip>
              <Chip variant="secondary">
                <MapPin className="mr-1 h-3.5 w-3.5" />
                {band.location}
              </Chip>
              <Chip variant="secondary">
                <Users className="mr-1 h-3.5 w-3.5" />
                {band.members} integrantes
              </Chip>
              <Chip variant="secondary">
                <Star className="mr-1 h-3.5 w-3.5 fill-accent text-accent" />
                {band.rating} · {band.totalShows} shows
              </Chip>
            </div>
            {band.priceRange && (
              <p className="text-muted relative z-10 text-sm">{band.priceRange}</p>
            )}
          </div>
          <Button
            className="button--hero relative z-10 shrink-0"
            isDisabled={!band.profileId}
            onPress={() => openProposal({ profileId: band.profileId, targetName: band.name })}
          >
            Enviar proposta
          </Button>
        </div>
      </header>

      <section className="container mx-auto px-4 py-8">
        <Tabs defaultSelectedKey="sobre">
          <Tabs.ListContainer>
            <Tabs.List aria-label="Perfil da banda">
              <Tabs.Tab id="sobre">Sobre<Tabs.Indicator /></Tabs.Tab>
              <Tabs.Tab id="precos">Preços<Tabs.Indicator /></Tabs.Tab>
              <Tabs.Tab id="avaliacoes">Avaliações<Tabs.Indicator /></Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>

          <Tabs.Panel id="sobre" className="mt-4">
            <Card className="border border-border shadow-none">
              <Card.Content className="space-y-6">
                <div>
                  <h3 className="font-display mb-2 text-lg font-semibold">Sobre a banda</h3>
                  <p className="text-muted max-w-[65ch] text-sm leading-relaxed">
                    {band.description || 'Sem descrição cadastrada.'}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-[var(--radius)] border border-border bg-surface/50 p-4">
                    <p className="text-muted text-xs">Estilo</p>
                    <p className="mt-1 text-sm font-medium">{band.genre}</p>
                  </div>
                  <div className="rounded-[var(--radius)] border border-border bg-surface/50 p-4">
                    <p className="text-muted text-xs">Cidade-base</p>
                    <p className="mt-1 text-sm font-medium">{band.location}</p>
                  </div>
                  <div className="rounded-[var(--radius)] border border-border bg-surface/50 p-4">
                    <p className="text-muted text-xs">Integrantes</p>
                    <p className="mt-1 text-sm font-medium">{band.members}</p>
                  </div>
                  <div className="rounded-[var(--radius)] border border-border bg-surface/50 p-4">
                    <p className="text-muted text-xs">Faixa de preço</p>
                    <p className="mt-1 text-sm font-medium">{band.priceRange || 'Sob consulta'}</p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel id="precos" className="mt-4">
            <Card className="border border-border shadow-none">
              <Card.Content>
                <p className="text-muted mb-1 text-sm">Valor médio por apresentação</p>
                <p className="font-display text-2xl font-semibold tabular-nums">
                  {band.priceRange || 'Sob consulta'}
                </p>
              </Card.Content>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel id="avaliacoes" className="mt-4">
            <Card className="border border-border shadow-none">
              <Card.Content className="flex flex-col items-center py-8 text-center">
                <div className="mb-2 flex items-center gap-2">
                  <Star className="h-8 w-8 text-accent fill-accent" />
                  <span className="font-display text-2xl font-semibold tabular-nums">{band.rating}</span>
                </div>
                <p className="text-muted">
                  Baseado em {band.totalShows} apresentações registradas na plataforma
                </p>
              </Card.Content>
            </Card>
          </Tabs.Panel>
        </Tabs>
        <SimilarProfiles kind="band" id={band.id} />
        <Recommendations kind="band" id={band.id} />
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
