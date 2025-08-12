import heroImage from "@/assets/hero-music.jpg";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/auth/AuthContext";

export default function BandaPerfil() {
  const { requireAuth } = useAuth();

  return (
    <main>
      <header className="relative h-56 w-full">
        <img src={heroImage} alt="Capa da banda" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="container mx-auto absolute bottom-4 left-0 right-0 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold">Nome da Banda</h1>
            <p className="text-muted-foreground">Rock • São Paulo • a partir de R$ 600</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => requireAuth('enviar-proposta')}>Enviar proposta</Button>
            <Button variant="outline" onClick={() => requireAuth('abrir-chat')}>Abrir chat</Button>
          </div>
        </div>
      </header>

      <section className="container mx-auto py-8">
        <Tabs defaultValue="sobre">
          <TabsList>
            <TabsTrigger value="sobre">Sobre</TabsTrigger>
            <TabsTrigger value="integrantes">Integrantes</TabsTrigger>
            <TabsTrigger value="portfolio">Portfólio</TabsTrigger>
            <TabsTrigger value="precos">Preços</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
          </TabsList>

          <TabsContent value="sobre" className="mt-4">
            <Card><CardContent className="pt-6">Bio, estilos e links.</CardContent></Card>
          </TabsContent>
          <TabsContent value="integrantes" className="mt-4">
            <Card><CardContent className="pt-6">Lista de integrantes.</CardContent></Card>
          </TabsContent>
          <TabsContent value="portfolio" className="mt-4">
            <Card><CardContent className="pt-6">Vídeos e áudios.</CardContent></Card>
          </TabsContent>
          <TabsContent value="precos" className="mt-4">
            <Card><CardContent className="pt-6">Faixas de preço.</CardContent></Card>
          </TabsContent>
          <TabsContent value="agenda" className="mt-4">
            <Card><CardContent className="pt-6">Calendário e disponibilidades.</CardContent></Card>
          </TabsContent>
          <TabsContent value="avaliacoes" className="mt-4">
            <Card><CardContent className="pt-6">Média e distribuição de notas.</CardContent></Card>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}
