'use client';

import HeroImage from '@/assets/hero-music.jpg';
import { ProposalModal } from '@/components/proposals/ProposalModal';
import { Button, Card, Tabs } from '@heroui/react';
import { useEstablishment } from '@/lib/hooks';
import { useAuth } from '@/lib/auth';
import { CheckCircle2, MapPin, Star } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function EstablishmentProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: establishment, isLoading } = useEstablishment(id);
  const { openAuthModal, isAuthenticated } = useAuth();
  const [proposalModalOpen, setProposalModalOpen] = useState(false);

  const handleInvite = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setProposalModalOpen(true);
  };

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

  return (
    <main>
      <header className="relative h-56 w-full">
        <Image src={HeroImage} alt="Capa do local" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="container mx-auto absolute bottom-4 left-0 right-0 flex items-end justify-between px-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground relative z-10">
              {establishment.name}
            </h1>
            <p className="text-muted relative z-10">
              {establishment.type} • {establishment.location} • capacidade {establishment.capacity}
            </p>
          </div>
          <Button className="button--hero relative z-10" onPress={handleInvite}>
            Convidar banda
          </Button>
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
              <Card.Content className="space-y-4">
                <p className="text-sm text-muted">{establishment.description || 'Sem descrição.'}</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <h3 className="text-sm font-medium">Endereço</h3>
                    <p className="text-sm inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> {establishment.location}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Capacidade</h3>
                    <p className="text-sm">{establishment.capacity} pessoas</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Tipo</h3>
                    <p className="text-sm inline-flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-accent" /> {establishment.type}
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel id="orcamentos" className="mt-4">
            <Card className="shadow-surface">
              <Card.Content>
                <p className="text-2xl font-bold font-display">
                  {establishment.averageBudget || 'Sob consulta'}
                </p>
              </Card.Content>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel id="avaliacoes" className="mt-4">
            <Card className="shadow-surface">
              <Card.Content className="flex items-center gap-2">
                <Star className="h-5 w-5 text-accent fill-accent" />
                <p className="font-medium">
                  Nota {establishment.rating} • {establishment.totalEvents} eventos
                </p>
              </Card.Content>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </section>

      {establishment.profileId && (
        <ProposalModal
          open={proposalModalOpen}
          onOpenChange={setProposalModalOpen}
          toProfileId={establishment.profileId}
          targetName={establishment.name}
        />
      )}
    </main>
  );
}
