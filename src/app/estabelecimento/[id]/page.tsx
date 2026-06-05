'use client';

import HeroImage from "@/assets/hero-music.jpg";
import { ProposalModal } from "@/components/proposals/ProposalModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEstablishment } from "@/lib/hooks";
import { useAuth } from "@/lib/auth";
import { CheckCircle2, MapPin, Star } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";

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
      <main className="container mx-auto py-10">
        <div className="animate-pulse h-64 bg-muted rounded-lg" />
      </main>
    );
  }

  if (!establishment) {
    return (
      <main className="container mx-auto py-10">
        <p className="text-muted-foreground">Estabelecimento não encontrado.</p>
      </main>
    );
  }

  return (
    <main>
      <header className="relative h-56 w-full">
        <Image src={HeroImage} alt="Capa do local" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="container mx-auto absolute bottom-4 left-0 right-0 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white relative z-10">{establishment.name}</h1>
            <p className="text-white/80 relative z-10">
              {establishment.type} • {establishment.location} • capacidade {establishment.capacity}
            </p>
          </div>
          <Button onClick={handleInvite} className="relative z-10">
            Convidar banda
          </Button>
        </div>
      </header>

      <section className="container mx-auto py-8">
        <Tabs defaultValue="sobre">
          <TabsList>
            <TabsTrigger value="sobre">Sobre</TabsTrigger>
            <TabsTrigger value="orcamentos">Orçamentos</TabsTrigger>
            <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
          </TabsList>
          <TabsContent value="sobre" className="mt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  {establishment.description || "Sem descrição."}
                </p>
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
                      <CheckCircle2 className="h-4 w-4 text-primary" /> {establishment.type}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="orcamentos" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-2xl font-bold">{establishment.averageBudget || "Sob consulta"}</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="avaliacoes" className="mt-4">
            <Card>
              <CardContent className="pt-6 flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <p className="font-medium">
                  Nota {establishment.rating} • {establishment.totalEvents} eventos
                </p>
              </CardContent>
            </Card>
          </TabsContent>
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
