'use client';

import { StatefulButton } from '@/components/aceternity/stateful-button';
import { EventDatePicker } from '@/components/shared/EventDatePicker';
import {
  FieldError,
  Input,
  Label,
  Modal,
  TextArea,
  TextField,
} from '@heroui/react';
import { createProposal } from '@/lib/api/proposals';
import { useAuth } from '@/lib/auth';
import type { DateValue } from '@internationalized/date';
import { getLocalTimeZone } from '@internationalized/date';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

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
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    date?: string;
    amount?: string;
    message?: string;
  }>({});

  useEffect(() => {
    if (!open) {
      setFormError(null);
      setFieldErrors({});
    }
  }, [open]);

  const validate = () => {
    const errors: typeof fieldErrors = {};
    if (!date) errors.date = 'Informe a data do evento';
    if (!amount.trim()) errors.amount = 'Informe o valor';
    else if (Number.isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      errors.amount = 'Valor inválido';
    }
    if (!message.trim()) errors.message = 'Escreva uma mensagem';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!validate() || !date) return;

    const eventDate = date.toDate(getLocalTimeZone());

    await createProposal({
      toProfileId,
      eventDate: eventDate.toISOString(),
      message: message.trim(),
      amount: parseFloat(amount),
    });

    await refreshAccount();
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['proposals'] });

    onProposalSent?.();
    onOpenChange(false);
    setDate(null);
    setMessage('');
    setAmount('');
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
            {formError && (
              <p className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                {formError}
              </p>
            )}

            <div className="space-y-4">
              <div>
                <EventDatePicker value={date} onChange={setDate} isRequired />
                {fieldErrors.date && (
                  <FieldError className="mt-1">{fieldErrors.date}</FieldError>
                )}
              </div>

              <TextField isInvalid={!!fieldErrors.amount} isRequired>
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
                {fieldErrors.amount && <FieldError>{fieldErrors.amount}</FieldError>}
              </TextField>

              <TextField isInvalid={!!fieldErrors.message} isRequired>
                <Label htmlFor="message">Mensagem</Label>
                <TextArea
                  id="message"
                  placeholder="Descreva o evento, horário, repertório desejado..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
                {fieldErrors.message && <FieldError>{fieldErrors.message}</FieldError>}
              </TextField>

              <StatefulButton
                type="button"
                onClick={async () => {
                  try {
                    await handleSubmit();
                  } catch (error) {
                    setFormError(
                      error instanceof Error ? error.message : 'Erro ao enviar proposta',
                    );
                    throw error;
                  }
                }}
              >
                Enviar proposta
              </StatefulButton>
            </div>
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};
