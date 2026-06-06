'use client';

import HeroImage from '@/assets/hero-music.jpg';
import { ProposalModal } from '@/components/proposals/ProposalModal';
import { Button, Card, Tabs } from '@heroui/react';
import { useBand } from '@/lib/hooks';
import { useAuth } from '@/lib/auth';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function BandProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: band, isLoading } = useBand(id);
  const { openAuthModal, isAuthenticated, canSendProposal } = useAuth();
  const router = useRouter();
  const [proposalModalOpen, setProposalModalOpen] = useState(false);

  const handleSendProposal = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    const { allowed, reason } = canSendProposal();
    if (!allowed) {
      if (reason?.includes('upgrade')) router.push('/assinatura');
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

  if (!band) {
    return (
      <main className="container mx-auto px-4 py-10">
        <p className="text-muted">Banda não encontrada.</p>
      </main>
    );
  }

  return (
    <main>
      <header className="relative h-56 w-full">
        <Image src={HeroImage} alt="Capa da banda" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="container mx-auto absolute bottom-4 left-0 right-0 flex items-end justify-between px-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground relative z-10">{band.name}</h1>
            <p className="text-muted relative z-10">
              {band.genre} • {band.location} • {band.priceRange || 'Consulte valores'}
            </p>
          </div>
          <Button className="button--hero relative z-10" onPress={handleSendProposal}>
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
            <Card className="shadow-surface">
              <Card.Content className="space-y-4">
                <p className="text-sm text-muted">{band.description || 'Sem descrição.'}</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <h3 className="text-sm font-medium">Cidade-base</h3>
                    <p className="text-sm">{band.location}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Estilo</h3>
                    <p className="text-sm">{band.genre}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Integrantes</h3>
                    <p className="text-sm">{band.members}</p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel id="precos" className="mt-4">
            <Card className="shadow-surface">
              <Card.Content>
                <p className="text-2xl font-bold font-display">{band.priceRange || 'Sob consulta'}</p>
              </Card.Content>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel id="avaliacoes" className="mt-4">
            <Card className="shadow-surface">
              <Card.Content className="flex items-center gap-2">
                <Star className="h-5 w-5 text-accent fill-accent" />
                <p className="font-medium">
                  Nota {band.rating} • {band.totalShows} shows
                </p>
              </Card.Content>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </section>

      {band.profileId && (
        <ProposalModal
          open={proposalModalOpen}
          onOpenChange={setProposalModalOpen}
          toProfileId={band.profileId}
          targetName={band.name}
          onProposalSent={() => setProposalModalOpen(false)}
        />
      )}
    </main>
  );
}
