'use client';

import { Recommendations } from '@/components/ml/Recommendations';
import HeroImage from '@/assets/hero-music.jpg';
import { ProposalModal } from '@/components/proposals/ProposalModal';
import { useProposalAction } from '@/components/proposals/useProposalAction';
import { Button, Card, Chip, Tabs } from '@heroui/react';
import { useEstablishment } from '@/lib/hooks';
import { useAuth } from '@/lib/auth';
import { Building2, MapPin, Star, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EstablishmentProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: establishment, isLoading } = useEstablishment(id);
  const { activeProfile } = useAuth();
  const { openProposal, modalOpen, setModalOpen, target } = useProposalAction();

  const isOwnEstablishment =
    activeProfile?.type === 'contratante' && activeProfile.entityId === establishment?.id;

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-10">
        <div className="animate-pulse h-64 bg-default/50 rounded-xl" />
      </main>
    );
  }

  if (!establishment) {
    return (
      <main className="container mx-auto px-4 py-10">
        <p className="text-muted">Estabelecimento não encontrado.</p>
      </main>
    );
  }

  const coverSrc = establishment.image || HeroImage;

  return (
    <main>
      <header className="relative h-64 w-full">
        <Image
          src={coverSrc}
          alt={`Capa de ${establishment.name}`}
          fill
          className="object-cover"
          unoptimized={!!establishment.image}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
        <div className="container mx-auto absolute bottom-4 left-0 right-0 flex flex-col gap-4 px-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold text-foreground relative z-10 md:text-4xl">
              {establishment.name}
            </h1>
            <div className="relative z-10 flex flex-wrap gap-2">
              <Chip variant="soft" color="accent">
                <Building2 className="mr-1 h-3.5 w-3.5" />
                {establishment.type}
              </Chip>
              <Chip variant="secondary">
                <MapPin className="mr-1 h-3.5 w-3.5" />
                {establishment.location}
              </Chip>
              <Chip variant="secondary">
                <Users className="mr-1 h-3.5 w-3.5" />
                {establishment.capacity} pessoas
              </Chip>
              <Chip variant="secondary">
                <Star className="mr-1 h-3.5 w-3.5 fill-accent text-accent" />
                {establishment.rating} · {establishment.totalEvents} eventos
              </Chip>
            </div>
            {establishment.averageBudget && (
              <p className="text-muted relative z-10 text-sm">
                Orçamento médio: {establishment.averageBudget}
              </p>
            )}
          </div>
          {isOwnEstablishment ? (
            <Link href="/bandas" className="relative z-10 shrink-0">
              <Button className="button--hero">Buscar bandas</Button>
            </Link>
          ) : (
            <Button
              className="button--hero relative z-10 shrink-0"
              isDisabled={!establishment.profileId}
              onPress={() =>
                openProposal({
                  profileId: establishment.profileId,
                  targetName: establishment.name,
                })
              }
            >
              Enviar proposta
            </Button>
          )}
        </div>
      </header>

      <section className="container mx-auto px-4 py-8">
        <Tabs defaultSelectedKey="sobre">
          <Tabs.ListContainer>
            <Tabs.List aria-label="Perfil do estabelecimento">
              <Tabs.Tab id="sobre">Sobre<Tabs.Indicator /></Tabs.Tab>
              <Tabs.Tab id="orcamentos">Orçamentos<Tabs.Indicator /></Tabs.Tab>
              <Tabs.Tab id="avaliacoes">Avaliações<Tabs.Indicator /></Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>

          <Tabs.Panel id="sobre" className="mt-4">
            <Card className="shadow-surface">
              <Card.Content className="space-y-6">
                <div>
                  <h3 className="font-display mb-2 text-lg font-semibold">Sobre o local</h3>
                  <p className="text-muted leading-relaxed">
                    {establishment.description || 'Sem descrição cadastrada.'}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-border bg-surface/50 p-4">
                    <p className="text-muted text-xs uppercase tracking-wide">Tipo</p>
                    <p className="mt-1 font-medium">{establishment.type}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-surface/50 p-4">
                    <p className="text-muted text-xs uppercase tracking-wide">Endereço</p>
                    <p className="mt-1 font-medium">{establishment.location}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-surface/50 p-4">
                    <p className="text-muted text-xs uppercase tracking-wide">Capacidade</p>
                    <p className="mt-1 font-medium">{establishment.capacity} pessoas</p>
                  </div>
                  <div className="rounded-lg border border-border bg-surface/50 p-4">
                    <p className="text-muted text-xs uppercase tracking-wide">Orçamento médio</p>
                    <p className="mt-1 font-medium">
                      {establishment.averageBudget || 'Sob consulta'}
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel id="orcamentos" className="mt-4">
            <Card className="shadow-surface">
              <Card.Content>
                <p className="text-muted mb-1 text-sm">Faixa de orçamento para shows</p>
                <p className="font-display text-3xl font-bold">
                  {establishment.averageBudget || 'Sob consulta'}
                </p>
              </Card.Content>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel id="avaliacoes" className="mt-4">
            <Card className="shadow-surface">
              <Card.Content className="flex flex-col items-center py-8 text-center">
                <div className="mb-2 flex items-center gap-2">
                  <Star className="h-8 w-8 text-accent fill-accent" />
                  <span className="font-display text-4xl font-bold">{establishment.rating}</span>
                </div>
                <p className="text-muted">
                  Baseado em {establishment.totalEvents} eventos registrados na plataforma
                </p>
              </Card.Content>
            </Card>
          </Tabs.Panel>
        </Tabs>
        <Recommendations kind="establishment" id={establishment.id} />
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
