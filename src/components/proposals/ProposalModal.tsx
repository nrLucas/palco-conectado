'use client';

import { StatefulButton } from '@/components/aceternity/stateful-button';
import { EventDatePicker } from '@/components/shared/EventDatePicker';
import { Button, FieldError, Input, Label, Modal, TextArea, TextField } from '@heroui/react';
import { suggestProposal, type ProposalSuggestion } from '@/lib/api/ml';
import { createProposal } from '@/lib/api/proposals';
import { useAuth } from '@/lib/auth';
import type { DateValue } from '@internationalized/date';
import { getLocalTimeZone } from '@internationalized/date';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const ACCEPTANCE_COPY = {
  alta: 'alta',
  media: 'média',
  baixa: 'baixa',
} as const;

function toIsoDate(value: DateValue): string {
  const eventDate = value.toDate(getLocalTimeZone());
  const month = String(eventDate.getMonth() + 1).padStart(2, '0');
  const day = String(eventDate.getDate()).padStart(2, '0');
  return `${eventDate.getFullYear()}-${month}-${day}`;
}

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
  const [insight, setInsight] = useState<ProposalSuggestion | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const eventIso = date ? toIsoDate(date) : null;
  const parsedAmount = Number(amount);
  const amountForModel = amount.trim() && Number.isFinite(parsedAmount) && parsedAmount > 0
    ? parsedAmount
    : undefined;

  useEffect(() => {
    if (!open) {
      setFormError(null);
      setFieldErrors({});
      setInsight(null);
      setInsightLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !eventIso) {
      setInsight(null);
      return;
    }

    let active = true;
    const handle = setTimeout(() => {
      setInsightLoading(true);
      suggestProposal({
        toProfileId,
        eventDate: eventIso,
        amount: amountForModel,
      })
        .then((response) => {
          if (active) setInsight(response);
        })
        .catch(() => {
          if (active) setInsight(null);
        })
        .finally(() => {
          if (active) setInsightLoading(false);
        });
    }, 350);

    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [open, eventIso, amountForModel, toProfileId]);

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

              <ProposalInsight
                loading={insightLoading}
                insight={insight}
                onUseAmount={(value) => setAmount(String(value))}
              />

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

function ProposalInsight({
  loading,
  insight,
  onUseAmount,
}: {
  loading: boolean;
  insight: ProposalSuggestion | null;
  onUseAmount: (amount: number) => void;
}) {
  if (loading && !insight) {
    return <p className="text-muted text-xs">Calculando cachê sugerido…</p>;
  }

  if (!insight) return null;

  if (!insight.available || insight.suggestedAmount === null) {
    return insight.message ? <p className="text-muted text-sm">{insight.message}</p> : null;
  }

  const probability = insight.acceptanceProbability;

  return (
    <div className="rounded-lg border border-accent/30 bg-accent/5 px-3 py-3">
      <p className="text-muted text-xs">Cachê sugerido</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="font-display text-2xl font-semibold tabular-nums">{currency.format(insight.suggestedAmount)}</p>
        <Button size="sm" variant="secondary" onPress={() => onUseAmount(insight.suggestedAmount!)}>
          Usar valor
        </Button>
      </div>
      <p className="text-muted mt-2 text-xs leading-relaxed">
        Regressão linear sobre capacidade, gênero, cidade e faixa de preço.
      </p>
      {probability !== null && insight.acceptanceLabel && (
        <div className="mt-3">
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span>
              {insight.acceptanceTarget === "venue"
                ? "Chance de a casa aceitar"
                : "Chance de a banda aceitar"}
            </span>
            <span className="font-medium">
              {Math.round(probability * 100)}% · {ACCEPTANCE_COPY[insight.acceptanceLabel]}
            </span>
          </div>
          <div className="bg-default mt-1 h-1.5 overflow-hidden rounded-full">
            <div
              className="bg-accent h-full"
              style={{ width: `${Math.round(probability * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
