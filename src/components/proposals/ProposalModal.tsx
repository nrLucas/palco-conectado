'use client';

import { EventDatePicker } from '@/components/shared/EventDatePicker';
import {
  Button,
  Input,
  Label,
  Modal,
  TextArea,
  TextField,
} from '@heroui/react';
import { toast } from '@/hooks/use-toast';
import { createProposal } from '@/lib/api/proposals';
import { useAuth } from '@/lib/auth';
import type { DateValue } from '@internationalized/date';
import { getLocalTimeZone } from '@internationalized/date';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ProposalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toProfileId: string;
  targetName: string;
  onProposalSent?: () => void;
}

export const ProposalModal = ({
  open,
  onOpenChange,
  toProfileId,
  targetName,
  onProposalSent,
}: ProposalModalProps) => {
  const { refreshAccount } = useAuth();
  const queryClient = useQueryClient();
  const [date, setDate] = useState<DateValue | null>(null);
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !message || !amount) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const eventDate = date.toDate(getLocalTimeZone());

      await createProposal({
        toProfileId,
        eventDate: eventDate.toISOString(),
        message,
        amount: parseFloat(amount),
      });

      toast({
        title: 'Proposta enviada!',
        description: `Sua proposta foi enviada para ${targetName}`,
      });

      await refreshAccount();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });

      onProposalSent?.();
      onOpenChange(false);
      setDate(null);
      setMessage('');
      setAmount('');
    } catch (error) {
      toast({
        title: 'Erro ao enviar proposta',
        description: error instanceof Error ? error.message : 'Tente novamente',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal.Backdrop isOpen={open} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-md">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Enviar proposta</Modal.Heading>
            <p className="text-sm text-muted">Envie uma proposta para {targetName}</p>
          </Modal.Header>

          <Modal.Body>
            <form onSubmit={handleSubmit} className="space-y-4">
              <EventDatePicker value={date} onChange={setDate} isRequired />

              <TextField isRequired>
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="600.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </TextField>

              <TextField isRequired>
                <Label htmlFor="message">Mensagem</Label>
                <TextArea
                  id="message"
                  placeholder="Descreva o evento, horário, repertório desejado..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </TextField>

              <Button type="submit" className="button--hero w-full" isDisabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar proposta'
                )}
              </Button>
            </form>
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};
