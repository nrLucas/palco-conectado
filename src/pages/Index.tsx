import heroImage from "@/assets/hero-music.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music2, Star, MapPin, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

const Index = () => {
  const featured = [
    { title: "Rock & Indie", desc: "Bandas com alta avaliação", to: "/bandas" },
    { title: "Sertanejo & MPB", desc: "Favoritas nos bares", to: "/bandas" },
    { title: "Jazz & Blues", desc: "Experiências intimistas", to: "/bandas" },
  ];

  return (
    <main>
      <section aria-labelledby="hero-heading" className="relative">
        <img src={heroImage} alt="Palco com luzes e instrumentos - marketplace de shows" className="h-[48vh] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/10" />
        <div className="container mx-auto absolute inset-0 flex flex-col items-start justify-center gap-4">
          <h1 id="hero-heading" className="text-3xl md:text-5xl font-bold max-w-2xl animate-enter">Marketplace de Shows para Bandas e Bares</h1>
          <p className="text-muted-foreground max-w-xl">Descubra artistas, negocie no chat e confirme reservas com avaliações reais.</p>
          <div className="flex w-full max-w-xl gap-2">
            <Input placeholder="Busque por banda, estilo ou cidade" aria-label="Busca global" />
            <Link to="/bandas"><Button variant="hero" className="hover-scale">Explorar</Button></Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto py-12" aria-labelledby="perfil-heading">
        <header className="mb-8">
          <h2 id="perfil-heading" className="text-2xl font-semibold">Como você quer usar?</h2>
          <p className="text-muted-foreground">Escolha seu perfil para uma experiência focada, no estilo iFood.</p>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-b from-background/70 to-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/40" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Sou Bar/Restaurante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">Busque <strong>bandas e cantores</strong> por estilo, cidade e nome. Veja nota geral (até 5 estrelas) e portfólios completos.</p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Filtros por estilo, cidade e avaliação</li>
                <li>Perfis com integrantes, melhores faixas e vídeos</li>
                <li>Histórico de apresentações e disponibilidade</li>
              </ul>
              <Link to="/bandas"><Button className="hover-scale">Entrar e buscar bandas</Button></Link>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-b from-background/70 to-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/40" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Music2 className="h-5 w-5" /> Sou Banda/Artista</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">Encontre <strong>bares e restaurantes</strong> por cidade, capacidade e cache oferecido. Consulte agenda e avaliações.</p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Filtros por cidade, capacidade e orçamento</li>
                <li>Detalhes de infraestrutura e vagas abertas</li>
                <li>Histórico, avaliações e contato</li>
              </ul>
              <Link to="/bares"><Button className="hover-scale">Entrar e buscar locais</Button></Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'PalcoMatch',
        url: '/',
        potentialAction: {
          '@type': 'SearchAction',
          target: '/bandas?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      }) }} />
    </main>
  );
};

export default Index;
