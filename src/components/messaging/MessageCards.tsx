'use client';

import type { ConversationType, MessageType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ClipboardList, Guitar, MessageCircle } from 'lucide-react';

// =============================================================================
// MESSAGE TYPE BADGE
// =============================================================================

interface MessageTypeBadgeProps {
  type: MessageType;
  size?: 'sm' | 'md';
}

export function MessageTypeBadge({ type, size = 'sm' }: MessageTypeBadgeProps) {
  const config = {
    text: {
      label: 'Mensagem',
      icon: MessageCircle,
      className: 'bg-muted text-muted-foreground',
    },
    proposal: {
      label: 'Proposta de Show',
      icon: ClipboardList,
      className: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    },
    collaboration: {
      label: 'Colaboração',
      icon: Guitar,
      className: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
    },
  }[type];

  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        padding,
        textSize,
        config.className
      )}
    >
      <Icon className={iconSize} />
      {config.label}
    </span>
  );
}

// =============================================================================
// CONVERSATION TYPE LABEL
// =============================================================================

interface ConversationTypeLabelProps {
  type: ConversationType;
}

export function ConversationTypeLabel({ type }: ConversationTypeLabelProps) {
  const labels: Record<ConversationType, { label: string; className: string }> = {
    show_proposal: {
      label: '📋 Shows',
      className: 'text-blue-600',
    },
    collaboration: {
      label: '🎸 Colaboração',
      className: 'text-purple-600',
    },
    general: {
      label: '💬 Geral',
      className: 'text-muted-foreground',
    },
  };

  const config = labels[type];

  return <span className={cn('text-xs font-medium', config.className)}>{config.label}</span>;
}

// =============================================================================
// PROPOSAL CARD
// =============================================================================

interface ProposalCardProps {
  eventDate: string;
  amount: number;
  duration: string;
  notes?: string;
  status?: 'pending' | 'accepted' | 'rejected';
  onAccept?: () => void;
  onReject?: () => void;
  onCounter?: () => void;
  isOwn?: boolean;
}

export function ProposalCard({
  eventDate,
  amount,
  duration,
  notes,
  status = 'pending',
  onAccept,
  onReject,
  onCounter,
  isOwn = false,
}: ProposalCardProps) {
  const formattedDate = new Date(eventDate).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const formattedAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);

  return (
    <div className="rounded-lg border-l-4 border-l-blue-500 bg-blue-500/5 p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <MessageTypeBadge type="proposal" size="md" />
        {status === 'pending' && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/30">
            Aguardando
          </span>
        )}
        {status === 'accepted' && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
            Aceita
          </span>
        )}
        {status === 'rejected' && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/30">
            Recusada
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Data</p>
          <p className="font-medium capitalize">{formattedDate}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Valor</p>
          <p className="font-medium text-blue-600">{formattedAmount}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Duração</p>
          <p className="font-medium">{duration}</p>
        </div>
      </div>

      {notes && (
        <p className="text-sm text-muted-foreground border-t pt-2">{notes}</p>
      )}

      {status === 'pending' && !isOwn && (
        <div className="flex gap-2 pt-2 border-t">
          <button
            onClick={onAccept}
            className="flex-1 py-1.5 px-3 text-sm rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition"
          >
            Aceitar
          </button>
          <button
            onClick={onCounter}
            className="flex-1 py-1.5 px-3 text-sm rounded-md bg-muted hover:bg-muted/80 transition"
          >
            Contraproposta
          </button>
          <button
            onClick={onReject}
            className="flex-1 py-1.5 px-3 text-sm rounded-md bg-red-500/10 text-red-600 hover:bg-red-500/20 transition"
          >
            Recusar
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// COLLABORATION CARD
// =============================================================================

interface CollaborationCardProps {
  type: 'vaga_banda' | 'projeto_pontual' | 'substituicao';
  instrument?: string;
  description: string;
  compensation?: string;
  startDate?: string;
  onRespond?: () => void;
  isOwn?: boolean;
}

export function CollaborationCard({
  type,
  instrument,
  description,
  compensation,
  startDate,
  onRespond,
  isOwn = false,
}: CollaborationCardProps) {
  const typeLabels = {
    vaga_banda: 'Vaga na Banda',
    projeto_pontual: 'Projeto Pontual',
    substituicao: 'Substituição',
  };

  const formattedDate = startDate
    ? new Date(startDate).toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div className="rounded-lg border-l-4 border-l-purple-500 bg-purple-500/5 p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <MessageTypeBadge type="collaboration" size="md" />
        <span className="text-xs font-medium text-purple-600">{typeLabels[type]}</span>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {instrument && (
          <span className="px-2 py-0.5 rounded-full bg-background border text-xs">
            🎸 {instrument}
          </span>
        )}
        {compensation && (
          <span className="px-2 py-0.5 rounded-full bg-background border text-xs">
            💰 {compensation}
          </span>
        )}
        {formattedDate && (
          <span className="px-2 py-0.5 rounded-full bg-background border text-xs">
            📅 {formattedDate}
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground">{description}</p>

      {!isOwn && (
        <div className="pt-2 border-t">
          <button
            onClick={onRespond}
            className="w-full py-1.5 px-3 text-sm rounded-md bg-purple-500 text-white hover:bg-purple-600 transition"
          >
            Responder proposta
          </button>
        </div>
      )}
    </div>
  );
}
