import HeroImage from "@/assets/hero-music.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Building2, Music2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section aria-labelledby="hero-heading" className="relative h-[48vh] w-full">
        {/* Next.js Image component optimized */}
        <Image
          src={HeroImage}
          alt="Palco com luzes e instrumentos - marketplace de shows"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/10" />
        <div className="container mx-auto absolute inset-0 flex flex-col items-start justify-center gap-4">
          <h1 id="hero-heading" className="text-3xl md:text-5xl font-bold max-w-2xl animate-enter text-white/90">
            Marketplace de Shows para Bandas e Bares
          </h1>
          <p className="text-white/80 max-w-xl text-lg">
            Descubra artistas, negocie no chat e confirme reservas com avaliações reais.
          </p>
          <div className="flex w-full max-w-xl gap-2">
            <Input 
              placeholder="Busque por banda, estilo ou cidade" 
              aria-label="Busca global" 
              className="bg-background/95 border-none h-12"
            />
            <Link href="/bandas">
              <Button variant="hero" className="hover-scale h-12 px-8">Explorar</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto py-12" aria-labelledby="perfil-heading">
        <header className="mb-8">
          <h2 id="perfil-heading" className="text-2xl font-semibold">Como você quer usar?</h2>
          <p className="text-muted-foreground">Escolha seu perfil para uma experiência focada.</p>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-b from-background/70 to-background/90 backdrop-blur shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition group">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/40" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 group-hover:text-primary transition-colors" /> 
                Sou Bar/Restaurante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Busque <strong>bandas e cantores</strong> por estilo, cidade e nome. Veja nota geral e portfólios completos.
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Filtros por estilo, cidade e avaliação</li>
                <li>Perfis com integrantes, melhores faixas e vídeos</li>
                <li>Histórico de apresentações e disponibilidade</li>
              </ul>
              <Link href="/bandas">
                <Button className="hover-scale w-full sm:w-auto">Entrar e buscar bandas</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-b from-background/70 to-background/90 backdrop-blur shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition group">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/40" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music2 className="h-5 w-5 group-hover:text-primary transition-colors" /> 
                Sou Banda/Artista
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Encontre <strong>bares e restaurantes</strong> por cidade, capacidade e cache oferecido.
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Filtros por cidade, capacidade e orçamento</li>
                <li>Detalhes de infraestrutura e vagas abertas</li>
                <li>Histórico, avaliações e contato</li>
              </ul>
              <Link href="/estabelecimentos">
                <Button className="hover-scale w-full sm:w-auto">Entrar e buscar locais</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
