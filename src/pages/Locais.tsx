import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, Heart } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

const mock = [
  { id: 1, name: "Bar Aurora", city: "São Paulo", offerUpTo: 1200, capacity: 150 },
  { id: 2, name: "Rest. Varanda", city: "Curitiba", offerUpTo: 900, capacity: 90 },
  { id: 3, name: "Pub Noite Feliz", city: "Florianópolis", offerUpTo: 1500, capacity: 200 },
];

export default function Locais() {
  const { requireAuth } = useAuth();

  return (
    <main className="container mx-auto py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Catálogo de Bares e Restaurantes</h1>
        <p className="text-muted-foreground">Abra vagas, convide bandas e gerencie sua agenda.</p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Lista de locais">
        {mock.map((v) => (
          <Card key={v.id} className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> {v.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {v.city}</p>
              <p className="mt-2 text-sm">Oferece até <strong>R$ {v.offerUpTo}</strong> • Capacidade {v.capacity}</p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={() => requireAuth('criar-vaga')}>Criar vaga</Button>
              <Button variant="outline" onClick={() => requireAuth('favoritar')}><Heart className="mr-2 h-4 w-4" /> Favoritar</Button>
            </CardFooter>
          </Card>
        ))}
      </section>
    </main>
  );
}
