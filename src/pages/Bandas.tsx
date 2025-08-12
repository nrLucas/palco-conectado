import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Heart } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

const mock = [
  { id: 1, name: "The Violet Cats", city: "São Paulo", priceFrom: 500, rating: 4.8, styles: ["Rock", "Indie"] },
  { id: 2, name: "Samba da Vila", city: "Rio de Janeiro", priceFrom: 400, rating: 4.6, styles: ["Samba", "Pagode"] },
  { id: 3, name: "Trio Jazz&Co", city: "Belo Horizonte", priceFrom: 700, rating: 4.9, styles: ["Jazz"] },
];

export default function Bandas() {
  const { requireAuth } = useAuth();

  return (
    <main className="container mx-auto py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Catálogo de Bandas</h1>
        <p className="text-muted-foreground">Filtre por estilo, faixa de preço, cidade e disponibilidade.</p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Lista de bandas">
        {mock.map((b) => (
          <Card key={b.id} className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{b.name}</span>
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground"><Star className="h-4 w-4 text-primary" /> {b.rating}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {b.city}</p>
              <p className="mt-2 text-sm">Preço a partir de <strong>R$ {b.priceFrom}</strong></p>
              <div className="mt-3 flex flex-wrap gap-2">
                {b.styles.map((s) => (
                  <span key={s} className="rounded bg-accent px-2 py-0.5 text-xs">{s}</span>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={() => requireAuth('enviar-proposta')}>Enviar proposta</Button>
              <Button variant="outline" onClick={() => requireAuth('favoritar')}><Heart className="mr-2 h-4 w-4" /> Favoritar</Button>
            </CardFooter>
          </Card>
        ))}
      </section>
    </main>
  );
}
