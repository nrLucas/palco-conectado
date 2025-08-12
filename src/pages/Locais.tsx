import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, Heart, Star } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const mock = [
  { id: 1, name: "Bar Aurora", city: "São Paulo", offerUpTo: 1200, capacity: 150, rating: 4.7 },
  { id: 2, name: "Rest. Varanda", city: "Curitiba", offerUpTo: 900, capacity: 90, rating: 4.5 },
  { id: 3, name: "Pub Noite Feliz", city: "Florianópolis", offerUpTo: 1500, capacity: 200, rating: 4.8 },
];

export default function Locais() {
  const { requireAuth } = useAuth();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string>("todas");
  const [minCapacity, setMinCapacity] = useState<number>(0);
  const [minOffer, setMinOffer] = useState<number>(0);

  const cities = Array.from(new Set(mock.map((v) => v.city))).sort();

  const filtered = mock.filter((v) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = q ? v.name.toLowerCase().includes(q) || v.city.toLowerCase().includes(q) : true;
    const matchesCity = city === "todas" ? true : v.city === city;
    const matchesCapacity = v.capacity >= minCapacity;
    const matchesOffer = v.offerUpTo >= minOffer;
    return matchesQuery && matchesCity && matchesCapacity && matchesOffer;
  });

  return (
    <main className="container mx-auto py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Encontre Bares e Restaurantes</h1>
        <p className="text-muted-foreground">Busque por cidade, capacidade e cache oferecido. Visual moderno tipo iFood.</p>
      </header>

      <section className="mb-6 grid gap-3 md:grid-cols-4" aria-label="Filtros">
        <div className="md:col-span-2">
          <Input placeholder="Buscar por nome ou cidade" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Buscar" />
        </div>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger aria-label="Cidade"><SelectValue placeholder="Cidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as cidades</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(minCapacity)} onValueChange={(v) => setMinCapacity(Number(v))}>
          <SelectTrigger aria-label="Capacidade mínima"><SelectValue placeholder="Capacidade mínima" /></SelectTrigger>
          <SelectContent>
            {[0,100,150,200].map((n) => (
              <SelectItem key={n} value={String(n)}>{n === 0 ? "Qualquer capacidade" : `A partir de ${n}`}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(minOffer)} onValueChange={(v) => setMinOffer(Number(v))}>
          <SelectTrigger aria-label="Oferta mínima"><SelectValue placeholder="Oferta mínima" /></SelectTrigger>
          <SelectContent>
            {[0,500,800,1000,1500].map((n) => (
              <SelectItem key={n} value={String(n)}>{n === 0 ? "Qualquer oferta" : `Oferece até ≥ R$ ${n}`}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Lista de locais">
        {filtered.map((v) => (
          <Card key={v.id} className="group relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-b from-background/70 to-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/40" />
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2"><Building2 className="h-5 w-5" /> {v.name}</span>
                <Badge variant="secondary" className="inline-flex items-center gap-1"><Star className="h-4 w-4 text-primary" /> {v.rating}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {v.city}</p>
              <p className="mt-2 text-sm">Oferece até <strong>R$ {v.offerUpTo}</strong> • Capacidade {v.capacity}</p>
            </CardContent>
            <CardFooter className="flex gap-2 flex-wrap">
              <Link to={`/bar/${v.id}`}><Button variant="secondary" className="hover-scale">Ver perfil</Button></Link>
              <Button onClick={() => requireAuth('criar-vaga')} className="hover-scale">Criar vaga</Button>
              <Button variant="outline" onClick={() => requireAuth('favoritar')} className="hover-scale"><Heart className="mr-2 h-4 w-4" /> Favoritar</Button>
            </CardFooter>
          </Card>
        ))}
      </section>
    </main>
  );
}
