'use client';

import { useCallback, useEffect, useState } from 'react';
import { storage } from './storage';
import type {
    Band,
    Conversation,
    ConversationType,
    Establishment,
    Message,
    Musician,
    ProfileType
} from './types';

// =============================================================================
// GENERIC LOADING STATE HOOK
// =============================================================================

interface UseDataResult<T> {
  data: T;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

function useData<T>(
  fetcher: () => T,
  deps: unknown[] = []
): UseDataResult<T> {
  const [data, setData] = useState<T>(() => fetcher());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true);
    try {
      setData(fetcher());
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    // Simulate async loading for realistic UX
    const timer = setTimeout(() => {
      refetch();
    }, 100);
    return () => clearTimeout(timer);
  }, deps);

  return { data, isLoading, error, refetch };
}

// =============================================================================
// MUSICIANS HOOK
// =============================================================================

interface UseMusiciansMutations {
  create: (data: Omit<Musician, 'id' | 'rating' | 'totalGigs' | 'createdAt'>) => Musician;
  update: (id: string, updates: Partial<Musician>) => void;
  remove: (id: string) => void;
}

export function useMusicians(userId?: string): UseDataResult<Musician[]> & UseMusiciansMutations {
  const fetcher = useCallback(() => {
    return userId ? storage.getMusiciansByUser(userId) : storage.getMusicians();
  }, [userId]);

  const { data, isLoading, error, refetch } = useData(fetcher, [userId]);

  const create = useCallback((musicianData: Omit<Musician, 'id' | 'rating' | 'totalGigs' | 'createdAt'>) => {
    const musician: Musician = {
      ...musicianData,
      id: `musician-${Date.now()}`,
      rating: 5.0,
      totalGigs: 0,
      createdAt: new Date().toISOString(),
    };
    storage.saveMusician(musician);
    refetch();
    return musician;
  }, [refetch]);

  const update = useCallback((id: string, updates: Partial<Musician>) => {
    const existing = storage.getMusicianById(id);
    if (existing) {
      storage.saveMusician({ ...existing, ...updates });
      refetch();
    }
  }, [refetch]);

  const remove = useCallback((id: string) => {
    storage.deleteMusician(id);
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch, create, update, remove };
}

// =============================================================================
// BANDS HOOK
// =============================================================================

interface UseBandsMutations {
  create: (data: Omit<Band, 'id' | 'rating' | 'totalShows' | 'createdAt'>) => Band;
  update: (id: string, updates: Partial<Band>) => void;
  remove: (id: string) => void;
}

export function useBands(userId?: string): UseDataResult<Band[]> & UseBandsMutations {
  const fetcher = useCallback(() => {
    return userId ? storage.getBandsByUser(userId) : storage.getBands();
  }, [userId]);

  const { data, isLoading, error, refetch } = useData(fetcher, [userId]);

  const create = useCallback((bandData: Omit<Band, 'id' | 'rating' | 'totalShows' | 'createdAt'>) => {
    const band: Band = {
      ...bandData,
      id: `band-${Date.now()}`,
      rating: 5.0,
      totalShows: 0,
      createdAt: new Date().toISOString(),
    };
    storage.saveBand(band);
    refetch();
    return band;
  }, [refetch]);

  const update = useCallback((id: string, updates: Partial<Band>) => {
    const existing = storage.getBandById(id);
    if (existing) {
      storage.saveBand({ ...existing, ...updates });
      refetch();
    }
  }, [refetch]);

  const remove = useCallback((id: string) => {
    storage.deleteBand(id);
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch, create, update, remove };
}

// =============================================================================
// ESTABLISHMENTS HOOK
// =============================================================================

interface UseEstablishmentsMutations {
  create: (data: Omit<Establishment, 'id' | 'rating' | 'totalEvents' | 'createdAt'>) => Establishment;
  update: (id: string, updates: Partial<Establishment>) => void;
  remove: (id: string) => void;
}

export function useEstablishments(userId?: string): UseDataResult<Establishment[]> & UseEstablishmentsMutations {
  const fetcher = useCallback(() => {
    return userId ? storage.getEstablishmentsByUser(userId) : storage.getEstablishments();
  }, [userId]);

  const { data, isLoading, error, refetch } = useData(fetcher, [userId]);

  const create = useCallback((estData: Omit<Establishment, 'id' | 'rating' | 'totalEvents' | 'createdAt'>) => {
    const establishment: Establishment = {
      ...estData,
      id: `est-${Date.now()}`,
      rating: 5.0,
      totalEvents: 0,
      createdAt: new Date().toISOString(),
    };
    storage.saveEstablishment(establishment);
    refetch();
    return establishment;
  }, [refetch]);

  const update = useCallback((id: string, updates: Partial<Establishment>) => {
    const existing = storage.getEstablishmentById(id);
    if (existing) {
      storage.saveEstablishment({ ...existing, ...updates });
      refetch();
    }
  }, [refetch]);

  const remove = useCallback((id: string) => {
    storage.deleteEstablishment(id);
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch, create, update, remove };
}

// =============================================================================
// CONVERSATIONS HOOK
// =============================================================================

interface UseConversationsMutations {
  create: (
    participants: { profileId: string; profileType: ProfileType; name: string; image?: string }[],
    type: ConversationType
  ) => Conversation;
  markAsRead: (conversationId: string) => void;
}

export function useConversations(profileId?: string): UseDataResult<Conversation[]> & UseConversationsMutations {
  const fetcher = useCallback(() => {
    return profileId ? storage.getConversationsByProfile(profileId) : storage.getConversations();
  }, [profileId]);

  const { data, isLoading, error, refetch } = useData(fetcher, [profileId]);

  const create = useCallback((
    participants: { profileId: string; profileType: ProfileType; name: string; image?: string }[],
    type: ConversationType
  ) => {
    const now = new Date().toISOString();
    const conversation: Conversation = {
      id: `conv-${Date.now()}`,
      participants,
      type,
      unreadCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    storage.saveConversation(conversation);
    refetch();
    return conversation;
  }, [refetch]);

  const markAsRead = useCallback((conversationId: string) => {
    const conversation = storage.getConversationById(conversationId);
    if (conversation) {
      conversation.unreadCount = 0;
      storage.saveConversation(conversation);
      refetch();
    }
  }, [refetch]);

  return { data, isLoading, error, refetch, create, markAsRead };
}

// =============================================================================
// MESSAGES HOOK
// =============================================================================

interface UseMessagesMutations {
  send: (message: Omit<Message, 'id' | 'status' | 'createdAt'>) => Message;
}

export function useMessages(conversationId: string): UseDataResult<Message[]> & UseMessagesMutations {
  const fetcher = useCallback(() => {
    return storage.getMessagesByConversation(conversationId);
  }, [conversationId]);

  const { data, isLoading, error, refetch } = useData(fetcher, [conversationId]);

  const send = useCallback((messageData: Omit<Message, 'id' | 'status' | 'createdAt'>) => {
    const message: Message = {
      ...messageData,
      id: `msg-${Date.now()}`,
      status: 'sent',
      createdAt: new Date().toISOString(),
    };
    storage.saveMessage(message);

    // Update unread count for other participant
    const conversation = storage.getConversationById(conversationId);
    if (conversation) {
      conversation.unreadCount += 1;
      storage.saveConversation(conversation);
    }

    refetch();
    return message;
  }, [conversationId, refetch]);

  return { data, isLoading, error, refetch, send };
}

// =============================================================================
// SINGLE ENTITY HOOKS
// =============================================================================

export function useMusician(id: string): UseDataResult<Musician | null> {
  const fetcher = useCallback(() => storage.getMusicianById(id), [id]);
  return useData(fetcher, [id]);
}

export function useBand(id: string): UseDataResult<Band | null> {
  const fetcher = useCallback(() => storage.getBandById(id), [id]);
  return useData(fetcher, [id]);
}

export function useEstablishment(id: string): UseDataResult<Establishment | null> {
  const fetcher = useCallback(() => storage.getEstablishmentById(id), [id]);
  return useData(fetcher, [id]);
}

export function useConversation(id: string): UseDataResult<Conversation | null> {
  const fetcher = useCallback(() => storage.getConversationById(id), [id]);
  return useData(fetcher, [id]);
}

// =============================================================================
// SEARCH HOOKS
// =============================================================================

interface SearchFilters {
  query?: string;
  location?: string;
  genre?: string;
  instrument?: string;
  availability?: string;
}

export function useSearchMusicians(filters: SearchFilters = {}): UseDataResult<Musician[]> {
  const fetcher = useCallback(() => {
    let results = storage.getMusicians();

    if (filters.query) {
      const q = filters.query.toLowerCase();
      results = results.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.bio.toLowerCase().includes(q) ||
        m.instruments.some(i => i.toLowerCase().includes(q))
      );
    }

    if (filters.location) {
      const loc = filters.location.toLowerCase();
      results = results.filter(m => m.location.toLowerCase().includes(loc));
    }

    if (filters.instrument) {
      results = results.filter(m =>
        m.instruments.some(i => i.toLowerCase() === filters.instrument?.toLowerCase())
      );
    }

    if (filters.availability && filters.availability !== 'all') {
      results = results.filter(m => m.availability === filters.availability);
    }

    return results;
  }, [filters.query, filters.location, filters.instrument, filters.availability]);

  return useData(fetcher, [filters.query, filters.location, filters.instrument, filters.availability]);
}

export function useSearchBands(filters: SearchFilters = {}): UseDataResult<Band[]> {
  const fetcher = useCallback(() => {
    let results = storage.getBands();

    if (filters.query) {
      const q = filters.query.toLowerCase();
      results = results.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.genre.toLowerCase().includes(q)
      );
    }

    if (filters.location) {
      const loc = filters.location.toLowerCase();
      results = results.filter(b => b.location.toLowerCase().includes(loc));
    }

    if (filters.genre) {
      results = results.filter(b =>
        b.genre.toLowerCase().includes(filters.genre!.toLowerCase())
      );
    }

    return results;
  }, [filters.query, filters.location, filters.genre]);

  return useData(fetcher, [filters.query, filters.location, filters.genre]);
}

export function useSearchEstablishments(filters: SearchFilters = {}): UseDataResult<Establishment[]> {
  const fetcher = useCallback(() => {
    let results = storage.getEstablishments();

    if (filters.query) {
      const q = filters.query.toLowerCase();
      results = results.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q)
      );
    }

    if (filters.location) {
      const loc = filters.location.toLowerCase();
      results = results.filter(e => e.location.toLowerCase().includes(loc));
    }

    return results;
  }, [filters.query, filters.location]);

  return useData(fetcher, [filters.query, filters.location]);
}
