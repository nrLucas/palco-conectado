'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { updateProposalStatus, cancelProposal } from '@/lib/api/proposals';
import { useProposals } from '@/lib/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PropostasPage() {
  const queryClient = useQueryClient();
  const { data: received = [], isLoading: loadingReceived } = useProposals('received');
  const { data: sent = [], isLoading: loadingSent } = useProposals('sent');

  const handleStatus = async (id: string, status: 'accepted' | 'rejected') => {
    try {
      await updateProposalStatus(id, status);
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: status === 'accepted' ? 'Proposta aceita' : 'Proposta recusada',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Tente novamente',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelProposal(id);
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast({ title: 'Proposta cancelada' });
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Tente novamente',
        variant: 'destructive',
      });
    }
  };

  const renderProposal = (
    proposal: (typeof received)[0],
    mode: 'received' | 'sent'
  ) => (
    <Card key={proposal.id}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>R$ {proposal.amount.toFixed(2)}</span>
          <Badge variant={proposal.status === 'pending' ? 'secondary' : 'default'}>
            {proposal.status === 'pending' ? 'Pendente' : proposal.status === 'accepted' ? 'Aceita' : 'Recusada'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {format(new Date(proposal.eventDate), "PPP", { locale: ptBR })}
        </p>
        <p className="text-sm">{proposal.message}</p>
        {mode === 'received' && proposal.status === 'pending' && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleStatus(proposal.id, 'accepted')}>
              Aceitar
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleStatus(proposal.id, 'rejected')}>
              Recusar
            </Button>
          </div>
        )}
        {mode === 'sent' && proposal.status === 'pending' && (
          <Button size="sm" variant="destructive" onClick={() => handleCancel(proposal.id)}>
            Cancelar
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <main className="container mx-auto py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Propostas</h1>
        <p className="text-muted-foreground">Gerencie propostas enviadas e recebidas.</p>
      </header>

      <Tabs defaultValue="received">
        <TabsList>
          <TabsTrigger value="received">Recebidas</TabsTrigger>
          <TabsTrigger value="sent">Enviadas</TabsTrigger>
        </TabsList>
        <TabsContent value="received" className="mt-6 grid gap-4 md:grid-cols-2">
          {loadingReceived ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : received.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma proposta recebida.</p>
          ) : (
            received.map((p) => renderProposal(p, 'received'))
          )}
        </TabsContent>
        <TabsContent value="sent" className="mt-6 grid gap-4 md:grid-cols-2">
          {loadingSent ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : sent.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma proposta enviada.</p>
          ) : (
            sent.map((p) => renderProposal(p, 'sent'))
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
