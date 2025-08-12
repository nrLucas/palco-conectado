import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Heart } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useState } from "react";

const mock = [
  { id: 1, name: "The Violet Cats", city: "São Paulo", priceFrom: 500, rating: 4.8, styles: ["Rock", "Indie"], members: 4 },
  { id: 2, name: "Samba da Vila", city: "Rio de Janeiro", priceFrom: 400, rating: 4.6, styles: ["Samba", "Pagode"], members: 6 },
  { id: 3, name: "Trio Jazz&Co", city: "Belo Horizonte", priceFrom: 700, rating: 4.9, styles: ["Jazz"], members: 3 },
];

export default function Bandas() {
  const { requireAuth } = useAuth();
  const [query, setQuery] = useState("");
  const [style, setStyle] = useState<string>("todas");
  const [city, setCity] = useState<string>("todas");
  const [minRating, setMinRating] = useState<number>(0);

  const styles = Array.from(new Set(mock.flatMap((b) => b.styles))).sort();
  const cities = Array.from(new Set(mock.map((b) => b.city))).sort();

  const filtered = mock.filter((b) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = q ? b.name.toLowerCase().includes(q) || b.city.toLowerCase().includes(q) : true;
    const matchesStyle = style === "todas" ? true : b.styles.includes(style);
    const matchesCity = city === "todas" ? true : b.city === city;
    const matchesRating = b.rating >= minRating;
    return matchesQuery && matchesStyle && matchesCity && matchesRating;
  });

  return (
    <main className="container mx-auto py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Encontre Bandas e Cantores</h1>
        <p className="text-muted-foreground">Filtre por estilo, cidade, nome e nota mínima. Visual moderno tipo iFood.</p>
      </header>

      <section className="mb-6 grid gap-3 md:grid-cols-4" aria-label="Filtros">
        <div className="md:col-span-2">
          <Input placeholder="Buscar por nome ou cidade" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Buscar" />
        </div>
        <Select value={style} onValueChange={setStyle}>
          <SelectTrigger aria-label="Estilo"><SelectValue placeholder="Estilo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos os estilos</SelectItem>
            {styles.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger aria-label="Cidade"><SelectValue placeholder="Cidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as cidades</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(minRating)} onValueChange={(v) => setMinRating(Number(v))}>
          <SelectTrigger aria-label="Nota mínima"><SelectValue placeholder="Nota mínima" /></SelectTrigger>
          <SelectContent>
            {[0,3,4,4.5].map((n) => (
              <SelectItem key={n} value={String(n)}>{n === 0 ? "Qualquer nota" : `A partir de ${n}`}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Lista de bandas">
        {filtered.map((b) => (
          <Card key={b.id} className="group relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-b from-background/70 to-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/40" />
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{b.name}</span>
                <Badge variant="secondary" className="inline-flex items-center gap-1"><Star className="h-4 w-4 text-primary" /> {b.rating}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {b.city}</p>
              <p className="mt-2 text-sm">Preço a partir de <strong>R$ {b.priceFrom}</strong> • <span className="text-muted-foreground">{b.members} integrantes</span></p>
              <div className="mt-3 flex flex-wrap gap-2">
                {b.styles.map((s) => (
                  <span key={s} className="rounded bg-accent px-2 py-0.5 text-xs">{s}</span>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 flex-wrap">
              <Link to={`/banda/${b.id}`}><Button variant="secondary" className="hover-scale">Ver perfil</Button></Link>
              <Button onClick={() => requireAuth('enviar-proposta')} className="hover-scale">Enviar proposta</Button>
              <Button variant="outline" onClick={() => requireAuth('favoritar')} className="hover-scale"><Heart className="mr-2 h-4 w-4" /> Favoritar</Button>
            </CardFooter>
          </Card>
        ))}
      </section>
    </main>
  );
}
