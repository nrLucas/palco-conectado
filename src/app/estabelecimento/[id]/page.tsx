'use client';

import HeroImage from "@/assets/hero-music.jpg";
import { ProposalModal } from "@/components/proposals/ProposalModal";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { CheckCircle2, MapPin, Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function EstablishmentProfilePage({ params }: { params: { id: string } }) {
  const { openAuthModal, isAuthenticated, account } = useAuth();
  const [proposalModalOpen, setProposalModalOpen] = useState(false);

  const handleAction = (action: string) => {
     if (!isAuthenticated) {
       openAuthModal('login');
       return;
     }
     
     if (action === 'convidar-banda') {
       setProposalModalOpen(true);
     }
  };

  return (
    <main>
      <header className="relative h-56 w-full">
        <Image 
          src={HeroImage} 
          alt="Capa do local" 
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="container mx-auto absolute bottom-4 left-0 right-0 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white relative z-10">Bar Aurora</h1>
            <p className="text-white/80 relative z-10">Centro • capacidade 150 • oferece até R$ 1.200</p>
          </div>
          <div className="flex gap-2 relative z-10">
            <Button onClick={() => handleAction('convidar-banda')}>
              Convidar banda
            </Button>
            <Button variant="outline" onClick={() => handleAction('criar-evento')}>Criar evento</Button>
          </div>
        </div>
      </header>

      <section className="container mx-auto py-8">
        <Tabs defaultValue="sobre">
          <TabsList>
            <TabsTrigger value="sobre">Sobre/Infra</TabsTrigger>
            <TabsTrigger value="agenda">Agenda & Vagas</TabsTrigger>
            <TabsTrigger value="orcamentos">Preços/Orçamentos</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
          </TabsList>

          <TabsContent value="sobre" className="mt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <h3 className="text-sm font-medium">Endereço</h3>
                    <p className="text-sm inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> Rua Harmonia, 123 — Vila Madalena, São Paulo</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Capacidade</h3>
                    <p className="text-sm">150 pessoas</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Faixa de cache</h3>
                    <p className="text-sm">Até R$ 1.200 por noite</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Infraestrutura</h3>
                  <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                    <li className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Palco 4x3m</li>
                    <li className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> PA 2 vias</li>
                    <li className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Monitores (2)</li>
                    <li className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Backline básico</li>
                    <li className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> 110/220V</li>
                    <li className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Camarim</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="agenda" className="mt-4">
            <Card>
              <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <Calendar mode="single" selected={new Date()} />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Vagas abertas</h3>
                  <ul className="space-y-2">
                    <li className="rounded border p-3">
                      <p className="font-medium">Sex • 27 Set • 20h–23h</p>
                      <p className="text-sm text-muted-foreground">Rock/Pop • Cache: R$ 900–1.200</p>
                    </li>
                    <li className="rounded border p-3">
                      <p className="font-medium">Sáb • 12 Out • 21h–00h</p>
                      <p className="text-sm text-muted-foreground">MPB/Samba • Cache: R$ 800–1.100</p>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="orcamentos" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Dias de semana</p>
                    <p className="text-2xl font-bold">R$ 700–1.000</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Finais de semana</p>
                    <p className="text-2xl font-bold">R$ 900–1.500</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Eventos privados</p>
                    <p className="text-2xl font-bold">R$ 1.500–2.500</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Valores podem variar conforme duração e público.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="historico" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <li className="rounded border p-4">
                    <p className="text-sm text-muted-foreground">12/08/2025 • The Violet Cats</p>
                    <div className="mt-1 flex items-center gap-1">
                      <Star className="h-4 w-4 text-primary" /><Star className="h-4 w-4 text-primary" /><Star className="h-4 w-4 text-primary" /><Star className="h-4 w-4 text-primary" /><Star className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mt-2 text-sm">Casa cheia e ótima interação com o público.</p>
                  </li>
                  <li className="rounded border p-4">
                    <p className="text-sm text-muted-foreground">28/07/2025 • Trio Jazz&Co</p>
                    <div className="mt-1 flex items-center gap-1">
                      <Star className="h-4 w-4 text-primary" /><Star className="h-4 w-4 text-primary" /><Star className="h-4 w-4 text-primary" /><Star className="h-4 w-4 text-primary" /><Star className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="mt-2 text-sm">Ambiente intimista, som impecável.</p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="avaliacoes" className="mt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <p className="font-medium">Nota geral 4.7 (18 avaliações)</p>
                </div>
                <ul className="space-y-3">
                  <li className="rounded border p-4">
                    <p className="text-sm text-muted-foreground">Banda: Samba da Vila • 10/06/2025</p>
                    <div className="mt-1 flex items-center gap-1">
                      <Star className="h-4 w-4 text-primary" /><Star className="h-4 w-4 text-primary" /><Star className="h-4 w-4 text-primary" /><Star className="h-4 w-4 text-primary" /><Star className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mt-2 text-sm">Equipe atenciosa, logística fácil e público animado.</p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <ProposalModal
        open={proposalModalOpen}
        onOpenChange={setProposalModalOpen}
        targetId="establishment-1"
        targetName="Bar Aurora"
        currentUserId={account?.id || ""}
      />
    </main>
  );
}
