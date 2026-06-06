'use client';

import { Button, Card } from '@heroui/react';
import { useAuth } from '@/lib/auth';
import { Building, Music, User } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { account, profiles, isAuthenticated, isLoading, openAuthModal } = useAuth();

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-10">
        <div className="animate-pulse h-48 bg-default/50 rounded-xl" />
      </main>
    );
  }

  if (!isAuthenticated || !account) {
    return (
      <main className="container mx-auto px-4 py-10 text-center space-y-4">
        <p className="text-muted">Faça login para ver seu perfil.</p>
        <Button onPress={() => openAuthModal('login')}>Entrar</Button>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10 space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold">Meu Perfil</h1>
        <p className="text-muted mt-1">Gerencie sua conta e perfis</p>
      </header>

      <Card className="shadow-surface">
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <User className="h-5 w-5 text-accent" /> Conta
          </Card.Title>
          <Card.Description>{account.email}</Card.Description>
        </Card.Header>
        <Card.Content className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-muted">Nome</p>
            <p className="font-medium">{account.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Plano</p>
            <p className="font-medium capitalize">{account.subscription?.tier || 'free'}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Propostas usadas</p>
            <p className="font-medium">
              {account.proposalsUsed || 0} / {account.proposalsLimit || 2}
            </p>
          </div>
        </Card.Content>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Seus perfis ({profiles.length})</h2>
          <Link href="/assinatura">
            <Button variant="outline" size="sm">
              Upgrade
            </Button>
          </Link>
        </div>

        {profiles.length === 0 ? (
          <Card>
            <Card.Content className="py-8 text-center text-muted">
              Você ainda não criou nenhum perfil. Complete o onboarding para começar.
            </Card.Content>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {profiles.map((profile) => (
              <Card key={profile.id} className="shadow-surface">
                <Card.Header>
                  <Card.Title className="flex items-center gap-2 text-base">
                    {profile.type === 'banda' ? (
                      <Music className="h-4 w-4 text-accent" />
                    ) : profile.type === 'contratante' ? (
                      <Building className="h-4 w-4 text-success" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    {(profile as { entityName?: string }).entityName || profile.type}
                  </Card.Title>
                  <Card.Description className="capitalize">
                    {profile.type.replace('_', ' ')}
                  </Card.Description>
                </Card.Header>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
