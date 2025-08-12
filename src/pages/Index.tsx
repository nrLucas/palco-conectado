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

      <section className="container mx-auto py-10" aria-labelledby="destaques-heading">
        <header className="mb-6">
          <h2 id="destaques-heading" className="text-xl font-semibold">Destaques</h2>
          <p className="text-muted-foreground">Seleção curada por avaliação e popularidade</p>
        </header>
        <Carousel>
          <CarouselContent>
            {featured.map((f) => (
              <CarouselItem key={f.title} className="md:basis-1/2 lg:basis-1/3">
                <Link to={f.to} className="block">
                  <Card className="hover-scale">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Music2 className="h-5 w-5" /> {f.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{f.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      <section className="container mx-auto py-10" aria-labelledby="categorias-heading">
        <h2 id="categorias-heading" className="text-xl font-semibold mb-4">Categorias</h2>
        <div className="flex flex-wrap gap-3">
          {['Rock','Sertanejo','MPB','Pagode','Pop','Jazz','Blues','Funk','Forró'].map((c) => (
            <Link to="/bandas" key={c}><Button variant="secondary" className="hover-scale">{c}</Button></Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto py-10 grid md:grid-cols-2 gap-6" aria-labelledby="atalhos-heading">
        <h2 id="atalhos-heading" className="sr-only">Atalhos</h2>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Music2 className="h-5 w-5" /> Bandas populares</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-accent" aria-hidden />
                  <div>
                    <p className="font-medium">Banda {i}</p>
                    <p className="text-sm text-muted-foreground inline-flex items-center gap-1"><Star className="h-4 w-4 text-primary" /> 4.{i} • a partir de R$ {300+i*50}</p>
                  </div>
                </div>
                <Link to="/bandas"><Button variant="outline">Ver</Button></Link>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Bares em destaque</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-accent" aria-hidden />
                  <div>
                    <p className="font-medium">Bar {i}</p>
                    <p className="text-sm text-muted-foreground inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> Centro • oferece até R$ {800+i*100}</p>
                  </div>
                </div>
                <Link to="/bares"><Button variant="outline">Ver</Button></Link>
              </div>
            ))}
          </CardContent>
        </Card>
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
