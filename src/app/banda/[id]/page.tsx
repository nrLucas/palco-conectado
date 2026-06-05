'use client';

import HeroImage from "@/assets/hero-music.jpg";
import { ProposalModal } from "@/components/proposals/ProposalModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBand } from "@/lib/hooks";
import { useAuth } from "@/lib/auth";
import { Star } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function BandProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: band, isLoading } = useBand(id);
  const { openAuthModal, isAuthenticated, canSendProposal, account } = useAuth();
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
      <main className="container mx-auto py-10">
        <div className="animate-pulse h-64 bg-muted rounded-lg" />
      </main>
    );
  }

  if (!band) {
    return (
      <main className="container mx-auto py-10">
        <p className="text-muted-foreground">Banda não encontrada.</p>
      </main>
    );
  }

  return (
    <main>
      <header className="relative h-56 w-full">
        <Image src={HeroImage} alt="Capa da banda" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="container mx-auto absolute bottom-4 left-0 right-0 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white relative z-10">{band.name}</h1>
            <p className="text-white/80 relative z-10">
              {band.genre} • {band.location} • {band.priceRange || "Consulte valores"}
            </p>
          </div>
          <div className="flex gap-2 relative z-10">
            <Button onClick={handleSendProposal}>Enviar proposta</Button>
          </div>
        </div>
      </header>

      <section className="container mx-auto py-8">
        <Tabs defaultValue="sobre">
          <TabsList>
            <TabsTrigger value="sobre">Sobre</TabsTrigger>
            <TabsTrigger value="precos">Preços</TabsTrigger>
            <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
          </TabsList>
          <TabsContent value="sobre" className="mt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm text-muted-foreground">{band.description || "Sem descrição."}</p>
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
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="precos" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-2xl font-bold">{band.priceRange || "Sob consulta"}</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="avaliacoes" className="mt-4">
            <Card>
              <CardContent className="pt-6 flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <p className="font-medium">Nota {band.rating} • {band.totalShows} shows</p>
              </CardContent>
            </Card>
          </TabsContent>
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
