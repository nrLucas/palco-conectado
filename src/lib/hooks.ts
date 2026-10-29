'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBands } from '@/lib/api/bands';
import { fetchMusicians } from '@/lib/api/musicians';
import { fetchEstablishments } from '@/lib/api/establishments';

export function useBands(params?: {
  query?: string;
  location?: string;
  genre?: string;
  minRating?: number;
}) {
  return useQuery({
    queryKey: ['bands', params],
    queryFn: () => fetchBands(params),
  });
}

export function useBand(id: string) {
  return useQuery({
    queryKey: ['band', id],
    queryFn: async () => {
      const { fetchBand } = await import('@/lib/api/bands');
      return fetchBand(id);
    },
    enabled: !!id,
  });
}

export function useMusician(id: string) {
  return useQuery({
    queryKey: ['musician', id],
    queryFn: async () => {
      const { fetchMusician } = await import('@/lib/api/musicians');
      return fetchMusician(id);
    },
    enabled: !!id,
  });
}

export function useSearchMusicians(params?: { query?: string }) {
  return useQuery({
    queryKey: ['musicians', params],
    queryFn: () => fetchMusicians(params),
  });
}

export function useEstablishments(params?: {
  query?: string;
  location?: string;
  type?: string;
  minRating?: number;
}) {
  return useQuery({
    queryKey: ['establishments', params],
    queryFn: () => fetchEstablishments(params),
  });
}

export function useEstablishment(id: string) {
  return useQuery({
    queryKey: ['establishment', id],
    queryFn: async () => {
      const { fetchEstablishment } = await import('@/lib/api/establishments');
      return fetchEstablishment(id);
    },
    enabled: !!id,
  });
}

export function useProposals(direction: 'sent' | 'received' = 'received') {
  return useQuery({
    queryKey: ['proposals', direction],
    queryFn: async () => {
      const { fetchProposals } = await import('@/lib/api/proposals');
      return fetchProposals(direction);
    },
  });
}
