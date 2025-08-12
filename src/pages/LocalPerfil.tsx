import heroImage from "@/assets/hero-music.jpg";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/auth/AuthContext";

export default function LocalPerfil() {
  const { requireAuth } = useAuth();

  return (
    <main>
      <header className="relative h-56 w-full">
        <img src={heroImage} alt="Capa do local" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="container mx-auto absolute bottom-4 left-0 right-0 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold">Bar/Restaurante Exemplo</h1>
            <p className="text-muted-foreground">Centro • capacidade 150 • oferece até R$ 1200</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => requireAuth('convidar-banda')}>Convidar banda</Button>
            <Button variant="outline" onClick={() => requireAuth('criar-vaga')}>Criar vaga</Button>
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
            <Card><CardContent className="pt-6">Endereço, infraestrutura e fotos.</CardContent></Card>
          </TabsContent>
          <TabsContent value="agenda" className="mt-4">
            <Card><CardContent className="pt-6">Datas e vagas abertas.</CardContent></Card>
          </TabsContent>
          <TabsContent value="orcamentos" className="mt-4">
            <Card><CardContent className="pt-6">Faixas de cache e negociações.</CardContent></Card>
          </TabsContent>
          <TabsContent value="historico" className="mt-4">
            <Card><CardContent className="pt-6">Eventos anteriores.</CardContent></Card>
          </TabsContent>
          <TabsContent value="avaliacoes" className="mt-4">
            <Card><CardContent className="pt-6">Notas e comentários de bandas.</CardContent></Card>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}
