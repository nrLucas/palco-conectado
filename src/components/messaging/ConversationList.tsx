'use client';

import { Avatar, Badge, Input, Label, TextField } from '@heroui/react';
import type { Conversation, ProfileType } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageCircle, Search } from 'lucide-react';
import { useState } from 'react';
import { ConversationTypeLabel } from './MessageCards';

interface ConversationItemProps {
  conversation: Conversation;
  currentProfileId: string;
  isSelected: boolean;
  onClick: () => void;
}

function ConversationItem({
  conversation,
  currentProfileId,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const otherParticipant =
    conversation.participants.find((p) => p.profileId !== currentProfileId) ||
    conversation.participants[0];

  const initials = otherParticipant.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const lastMessageTime = conversation.lastMessage
    ? formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
        addSuffix: true,
        locale: ptBR,
      })
    : '';

  const roleColors: Record<ProfileType, string> = {
    artista_independente: 'bg-[oklch(0.55_0.2_285)]',
    banda: 'bg-accent',
    contratante: 'bg-success',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
        isSelected ? 'bg-accent/10' : 'hover:bg-default/60'
      }`}
    >
      <div className="relative">
        <Avatar className="h-12 w-12">
          <Avatar.Image src={otherParticipant.image} alt={otherParticipant.name} />
          <Avatar.Fallback className="text-sm">{initials}</Avatar.Fallback>
        </Avatar>
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background ${roleColors[otherParticipant.profileType]}`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium truncate">{otherParticipant.name}</span>
          {conversation.unreadCount > 0 && (
            <Badge color="accent" size="sm">
              {conversation.unreadCount}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          <ConversationTypeLabel type={conversation.type} />
          <span className="text-xs text-muted">{lastMessageTime}</span>
        </div>

        {conversation.lastMessage && (
          <p className="text-sm text-muted truncate mt-1">
            {conversation.lastMessage.type === 'text'
              ? conversation.lastMessage.content
              : conversation.lastMessage.type === 'proposal'
                ? '📋 Nova proposta de show'
                : '🎸 Nova proposta de colaboração'}
          </p>
        )}
      </div>
    </button>
  );
}

interface ConversationListProps {
  conversations: Conversation[];
  currentProfileId: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  currentProfileId,
  selectedId,
  onSelect,
  isLoading = false,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = searchQuery
    ? conversations.filter((c) =>
        c.participants.some(
          (p) =>
            p.profileId !== currentProfileId &&
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : conversations;

  return (
    <div className="flex flex-col h-full border-r border-border">
      <div className="p-3 border-b border-border">
        <TextField>
          <Label className="sr-only">Buscar conversas</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none z-10" />
            <Input
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </TextField>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 animate-pulse">
                  <div className="flex gap-3">
                    <div className="h-12 w-12 rounded-full bg-default" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 bg-default rounded" />
                      <div className="h-3 w-32 bg-default rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 mx-auto text-muted/50 mb-3" />
              <p className="text-muted">
                {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
              </p>
              <p className="text-xs text-muted mt-1">Envie uma proposta para iniciar</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                currentProfileId={currentProfileId}
                isSelected={selectedId === conversation.id}
                onClick={() => onSelect(conversation.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
