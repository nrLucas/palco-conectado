'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { Building, Music, User } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { account, profiles, isAuthenticated, isLoading, openAuthModal } = useAuth();

  if (isLoading) {
    return (
      <main className="container mx-auto py-10">
        <div className="animate-pulse h-48 bg-muted rounded-lg" />
      </main>
    );
  }

  if (!isAuthenticated || !account) {
    return (
      <main className="container mx-auto py-10 text-center space-y-4">
        <p className="text-muted-foreground">Faça login para ver seu perfil.</p>
        <Button onClick={() => openAuthModal('login')}>Entrar</Button>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-10 space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie sua conta e perfis</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Conta
          </CardTitle>
          <CardDescription>{account.email}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Nome</p>
            <p className="font-medium">{account.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Plano</p>
            <p className="font-medium capitalize">{account.subscription?.tier || 'free'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Propostas usadas</p>
            <p className="font-medium">
              {account.proposalsUsed || 0} / {account.proposalsLimit || 2}
            </p>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Seus perfis ({profiles.length})</h2>
          <Link href="/assinatura">
            <Button variant="outline" size="sm">Upgrade</Button>
          </Link>
        </div>

        {profiles.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Você ainda não criou nenhum perfil. Complete o onboarding para começar.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {profiles.map((profile) => (
              <Card key={profile.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {profile.type === 'banda' ? (
                      <Music className="h-4 w-4" />
                    ) : profile.type === 'contratante' ? (
                      <Building className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    {(profile as { entityName?: string }).entityName || profile.type}
                  </CardTitle>
                  <CardDescription className="capitalize">{profile.type.replace('_', ' ')}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
