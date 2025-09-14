import heroImage from "@/assets/hero-music.jpg";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/auth/AuthContext";
import { Calendar } from "@/components/ui/calendar";
import { Star, Play, Video } from "lucide-react";
import { useState } from "react";
import { useCalendar } from "@/hooks/useCalendar";
import { ProposalModal } from "@/components/proposals/ProposalModal";
import { useNavigate } from "react-router-dom";

export default function BandaPerfil() {
  const { requireAuth, currentUser, canSendProposal } = useAuth();
  const navigate = useNavigate();
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const { selectedDate, setSelectedDate, isAvailable } = useCalendar();

  return (
    <main>
      <header className="relative h-56 w-full">
        <img src={heroImage} alt="Capa da banda" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="container mx-auto absolute bottom-4 left-0 right-0 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold">The Violet Cats</h1>
            <p className="text-muted-foreground">Rock/Indie • São Paulo • a partir de R$ 600</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => {
              requireAuth('enviar-proposta');
              
              const { canSend, reason } = canSendProposal();
              if (!canSend) {
                if (reason?.includes('upgrade')) {
                  navigate('/assinatura');
                }
                return;
              }
              setProposalModalOpen(true);
            }}>
              Enviar proposta
            </Button>
            <Button variant="outline" onClick={() => requireAuth('abrir-chat')}>Abrir chat</Button>
          </div>
        </div>
      </header>

      <section className="container mx-auto py-8">
        <Tabs defaultValue="sobre">
          <TabsList>
            <TabsTrigger value="sobre">Sobre</TabsTrigger>
            <TabsTrigger value="integrantes">Integrantes</TabsTrigger>
            <TabsTrigger value="portfolio">Vídeos & Faixas</TabsTrigger>
            <TabsTrigger value="precos">Preços</TabsTrigger>
            <TabsTrigger value="agenda">Agenda & Disponibilidade</TabsTrigger>
            <TabsTrigger value="avaliacoes">Avaliações por noite (23)</TabsTrigger>
          </TabsList>

          <TabsContent value="sobre" className="mt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Banda de rock alternativo com influências de indie e pop. Atuação em eventos corporativos,
                  bares e festivais. Palco completo, repertório versátil e presença marcante.
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <h3 className="text-sm font-medium">Cidade-base</h3>
                    <p className="text-sm">São Paulo - SP</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Estilos</h3>
                    <p className="text-sm">Rock, Indie, Pop</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Links</h3>
                    <div className="flex flex-wrap gap-3">
                      <a href="#" className="story-link text-sm" aria-label="Instagram">Instagram</a>
                      <a href="#" className="story-link text-sm" aria-label="Spotify">Spotify</a>
                      <a href="#" className="story-link text-sm" aria-label="YouTube">YouTube</a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="integrantes" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <ul className="grid gap-3 sm:grid-cols-2">
                  <li className="rounded-lg border p-4">
                    <p className="font-medium">Ana Ribeiro</p>
                    <p className="text-sm text-muted-foreground">Voz</p>
                  </li>
                  <li className="rounded-lg border p-4">
                    <p className="font-medium">Lucas Prado</p>
                    <p className="text-sm text-muted-foreground">Guitarra</p>
                  </li>
                  <li className="rounded-lg border p-4">
                    <p className="font-medium">Marina Lopes</p>
                    <p className="text-sm text-muted-foreground">Baixo</p>
                  </li>
                  <li className="rounded-lg border p-4">
                    <p className="font-medium">Diego Martins</p>
                    <p className="text-sm text-muted-foreground">Bateria</p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="portfolio" className="mt-4">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Melhores faixas</h3>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    <li className="rounded-lg border p-3 flex items-center justify-between">
                      <span>Midnight Drive</span>
                      <Button variant="outline" size="sm" aria-label="Ouvir Midnight Drive"><Play className="h-4 w-4 mr-1" />Ouvir</Button>
                    </li>
                    <li className="rounded-lg border p-3 flex items-center justify-between">
                      <span>Violet Skies</span>
                      <Button variant="outline" size="sm" aria-label="Ouvir Violet Skies"><Play className="h-4 w-4 mr-1" />Ouvir</Button>
                    </li>
                    <li className="rounded-lg border p-3 flex items-center justify-between">
                      <span>City Lights</span>
                      <Button variant="outline" size="sm" aria-label="Ouvir City Lights"><Play className="h-4 w-4 mr-1" />Ouvir</Button>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Vídeos</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg overflow-hidden border">
                      <iframe
                        title="Vídeo ao vivo 1"
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-56 w-full"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                      ></iframe>
                    </div>
                    <div className="rounded-lg overflow-hidden border">
                      <iframe
                        title="Vídeo ao vivo 2"
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-56 w-full"
                        src="https://www.youtube.com/embed/oHg5SJYRHA0"
                      ></iframe>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="precos" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">A partir de</p>
                    <p className="text-2xl font-bold">R$ 600</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Show completo (2h)</p>
                    <p className="text-2xl font-bold">R$ 1.200</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Eventos corporativos</p>
                    <p className="text-2xl font-bold">R$ 2.500</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Valores variam conforme duração, deslocamento e rider técnico.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="agenda" className="mt-4">
            <Card>
              <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
                 <div>
                   <Calendar 
                     mode="single" 
                     selected={selectedDate} 
                     onSelect={setSelectedDate}
                     modifiers={{
                       available: (date) => isAvailable(date, "band-1")
                     }}
                     modifiersStyles={{
                       available: { backgroundColor: 'hsl(var(--primary))', color: 'white' }
                     }}
                   />
                 </div>
                <div>
                  <h3 className="font-medium mb-2">Próximas disponibilidades</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center justify-between rounded border p-3">
                      <span>Sex • 20 Set</span><span className="text-sm text-muted-foreground">19h–23h</span>
                    </li>
                    <li className="flex items-center justify-between rounded border p-3">
                      <span>Sáb • 05 Out</span><span className="text-sm text-muted-foreground">20h–00h</span>
                    </li>
                    <li className="flex items-center justify-between rounded border p-3">
                      <span>Sex • 18 Out</span><span className="text-sm text-muted-foreground">19h–23h</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="avaliacoes" className="mt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <p className="font-medium">Nota geral 4.8 (23 avaliações)</p>
                </div>
                <ul className="space-y-3">
                  <li className="rounded border p-4">
                    <p className="text-sm text-muted-foreground">Noite 12/08/2025 • Bar Aurora</p>
                    <div className="mt-1 flex items-center gap-1">
                      <Star className="h-4 w-4 text-primary" /><Star className="h-4 w-4 text-primary" /><Star className="h-4 w-4 text-primary" /><Star className="h-4 w-4 text-primary" /><Star className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mt-2 text-sm">Energia altíssima, público engajado e repertório muito bom.</p>
                  </li>
                  <li className="rounded border p-4">
                    <p className="text-sm text-muted-foreground">Noite 28/07/2025 • Pub Noite Feliz</p>
                    <div className="mt-1 flex items-center gap-1">
                      <Star className="h-4 w-4 text-primary" /><Star className="h-4 w-4 text-primary" /><Star className="h-4 w-4 text-primary" /><Star className="h-4 w-4 text-primary" /><Star className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="mt-2 text-sm">Som equilibrado e comunicação impecável com a equipe.</p>
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
        currentUserId={currentUser?.id || ""}
        onProposalSent={() => {
          // Refresh user data to update proposal count
          window.location.reload();
        }}
      />
    </main>
  );
}
