'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSearchMusicians } from '@/lib/hooks';
import { MapPin, Star } from 'lucide-react';
import { useState } from 'react';

export default function MusiciansPage() {
  const [query, setQuery] = useState('');
  const { data: musicians, isLoading } = useSearchMusicians({ query });

  return (
    <main className="container mx-auto py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Encontre Músicos Independentes</h1>
        <p className="text-muted-foreground">Bateristas, guitarristas e vocalistas prontos para sua banda ou gig.</p>
      </header>

      <div className="mb-8">
        <Input 
          placeholder="Buscar por instrumento, nome ou estilo..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => (
            <Card key={i} className="animate-pulse h-64 bg-muted/50" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {musicians.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-12">
              Nenhum músico encontrado. Experimente buscar por outro termo.
            </p>
          ) : (
            musicians.map((musician) => (
              <Card key={musician.id} className="overflow-hidden hover:shadow-md transition">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{musician.name}</span>
                    <Badge variant="secondary" className="gap-1">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      {musician.rating}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {musician.instruments.map(inst => (
                      <Badge key={inst} variant="outline" className="bg-primary/5">{inst}</Badge>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {musician.location}
                  </div>
                  <p className="text-sm line-clamp-2">{musician.bio}</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Ver Perfil</Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}
    </main>
  );
}
