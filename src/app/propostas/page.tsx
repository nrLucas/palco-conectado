'use client';

import { Button, Card, Chip, Tabs } from '@heroui/react';
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
      toast({ title: status === 'accepted' ? 'Proposta aceita' : 'Proposta recusada' });
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

  const renderProposal = (proposal: (typeof received)[0], mode: 'received' | 'sent') => (
    <Card key={proposal.id} className="shadow-surface">
      <Card.Header>
        <Card.Title className="flex items-center justify-between text-base">
          <span>R$ {proposal.amount.toFixed(2)}</span>
          <Chip
            variant="soft"
            color={
              proposal.status === 'pending'
                ? 'default'
                : proposal.status === 'accepted'
                  ? 'success'
                  : 'danger'
            }
          >
            {proposal.status === 'pending'
              ? 'Pendente'
              : proposal.status === 'accepted'
                ? 'Aceita'
                : 'Recusada'}
          </Chip>
        </Card.Title>
      </Card.Header>
      <Card.Content className="space-y-3">
        <p className="text-sm text-muted">
          {format(new Date(proposal.eventDate), 'PPP', { locale: ptBR })}
        </p>
        <p className="text-sm">{proposal.message}</p>
        {mode === 'received' && proposal.status === 'pending' && (
          <div className="flex gap-2">
            <Button size="sm" onPress={() => handleStatus(proposal.id, 'accepted')}>
              Aceitar
            </Button>
            <Button size="sm" variant="outline" onPress={() => handleStatus(proposal.id, 'rejected')}>
              Recusar
            </Button>
          </div>
        )}
        {mode === 'sent' && proposal.status === 'pending' && (
          <Button size="sm" variant="danger" onPress={() => handleCancel(proposal.id)}>
            Cancelar
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <main className="container mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold">Propostas</h1>
        <p className="text-muted mt-1">Gerencie propostas enviadas e recebidas.</p>
      </header>

      <Tabs defaultSelectedKey="received" className="w-full">
        <Tabs.ListContainer>
          <Tabs.List aria-label="Propostas">
            <Tabs.Tab id="received">
              Recebidas
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="sent">
              Enviadas
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel id="received" className="mt-6 grid gap-4 md:grid-cols-2">
          {loadingReceived ? (
            <p className="text-muted">Carregando...</p>
          ) : received.length === 0 ? (
            <p className="text-muted">Nenhuma proposta recebida.</p>
          ) : (
            received.map((p) => renderProposal(p, 'received'))
          )}
        </Tabs.Panel>

        <Tabs.Panel id="sent" className="mt-6 grid gap-4 md:grid-cols-2">
          {loadingSent ? (
            <p className="text-muted">Carregando...</p>
          ) : sent.length === 0 ? (
            <p className="text-muted">Nenhuma proposta enviada.</p>
          ) : (
            sent.map((p) => renderProposal(p, 'sent'))
          )}
        </Tabs.Panel>
      </Tabs>
    </main>
  );
}
