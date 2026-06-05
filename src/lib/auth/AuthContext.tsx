'use client';

import { toast } from '@/hooks/use-toast';
import { fetchMe, registerUser, switchActiveProfile } from '@/lib/api/auth';
import type { MeResponse } from '@/lib/api/auth';
import type {
  Band,
  Establishment,
  Musician,
  ProfileType,
  UserAccount,
  UserProfile,
} from '@/lib/types';
import { signIn, signOut, useSession } from 'next-auth/react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface AuthContextValue {
  account: UserAccount | null;
  session: null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  activeProfile: UserProfile | null;
  activeEntity: Musician | Band | Establishment | null;
  profiles: UserProfile[];
  switchProfile: (profileId: string) => void;
  addProfile: (type: ProfileType, entityId: string, role?: 'owner' | 'member') => UserProfile;
  removeProfile: (profileId: string) => void;
  canSendProposal: () => { allowed: boolean; reason?: string };
  canCreateProfile: () => { allowed: boolean; max: number; current: number };
  needsOnboarding: boolean;
  completeOnboarding: () => void;
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  authModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  refreshAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [isLoadingMe, setIsLoadingMe] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const refreshAccount = useCallback(async () => {
    if (!session?.user) {
      setMe(null);
      return;
    }
    setIsLoadingMe(true);
    try {
      const data = await fetchMe();
      setMe(data);
    } catch {
      setMe(null);
    } finally {
      setIsLoadingMe(false);
    }
  }, [session?.user]);

  useEffect(() => {
    if (status === 'authenticated') {
      refreshAccount();
    } else if (status === 'unauthenticated') {
      setMe(null);
    }
  }, [status, refreshAccount]);

  const account = me;
  const isAuthenticated = !!session?.user && !!account;
  const isLoading = status === 'loading' || (status === 'authenticated' && isLoadingMe);
  const profiles = account?.profiles || [];

  const activeProfile = useMemo(() => {
    if (!account?.activeProfileId) return null;
    return profiles.find((p) => p.id === account.activeProfileId) || null;
  }, [account?.activeProfileId, profiles]);

  const activeEntity = (account?.activeEntity as unknown as Musician | Band | Establishment | null) ?? null;
  const needsOnboarding = isAuthenticated && profiles.length === 0;

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      toast({
        title: 'Erro no login',
        description: 'E-mail ou senha incorretos',
        variant: 'destructive',
      });
      return false;
    }

    setAuthModalOpen(false);
    toast({
      title: 'Login realizado!',
      description: 'Bem-vindo(a) de volta',
    });
    return true;
  }, []);

  const signup = useCallback(
    async (email: string, password: string, name: string): Promise<boolean> => {
      try {
        await registerUser({ email, password, name });
        const loggedIn = await login(email, password);
        if (loggedIn) {
          toast({
            title: 'Cadastro realizado!',
            description: `Bem-vindo(a), ${name}`,
          });
        }
        return loggedIn;
      } catch (error) {
        toast({
          title: 'Erro no cadastro',
          description:
            error instanceof Error ? error.message : 'Não foi possível criar a conta',
          variant: 'destructive',
        });
        return false;
      }
    },
    [login]
  );

  const logout = useCallback(() => {
    signOut({ redirect: false });
    setMe(null);
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado',
    });
  }, []);

  const switchProfile = useCallback(
    async (profileId: string) => {
      if (!account) return;
      try {
        await switchActiveProfile(profileId);
        await update({ activeProfileId: profileId });
        await refreshAccount();
        toast({
          title: 'Perfil alterado',
          description: 'Perfil ativo atualizado',
        });
      } catch {
        toast({
          title: 'Erro',
          description: 'Não foi possível trocar de perfil',
          variant: 'destructive',
        });
      }
    },
    [account, update, refreshAccount]
  );

  const addProfile = useCallback(
    (_type: ProfileType, _entityId: string, _role: 'owner' | 'member' = 'owner'): UserProfile => {
      throw new Error('Use POST /api/profiles via onboarding');
    },
    []
  );

  const removeProfile = useCallback((_profileId: string) => {
    // handled via API in profile page
  }, []);

  const completeOnboarding = useCallback(() => {
    refreshAccount();
  }, [refreshAccount]);

  const canSendProposal = useCallback(() => {
    if (!account) {
      return { allowed: false, reason: 'Faça login para enviar propostas' };
    }
    if (!account.activeProfileId) {
      return { allowed: false, reason: 'Selecione um perfil ativo' };
    }
    if (account.proposalsUsed >= account.proposalsLimit) {
      return {
        allowed: false,
        reason: `Limite de ${account.proposalsLimit} propostas atingido. Faça upgrade!`,
      };
    }
    return { allowed: true };
  }, [account]);

  const canCreateProfile = useCallback(() => {
    const limits: Record<string, number> = {
      free: 2,
      basic: 5,
      premium: 10,
      enterprise: 50,
    };
    const max = limits[account?.subscription?.tier || 'free'] || 2;
    const current = profiles.length;
    return { allowed: current < max, max, current };
  }, [account, profiles.length]);

  const openAuthModal = useCallback((mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      account,
      session: null,
      isAuthenticated,
      isLoading,
      login,
      signup,
      logout,
      activeProfile,
      activeEntity,
      profiles,
      switchProfile,
      addProfile,
      removeProfile,
      canSendProposal,
      canCreateProfile,
      needsOnboarding,
      completeOnboarding,
      openAuthModal,
      closeAuthModal,
      authModalOpen,
      authModalMode,
      refreshAccount,
    }),
    [
      account,
      isAuthenticated,
      isLoading,
      login,
      signup,
      logout,
      activeProfile,
      activeEntity,
      profiles,
      switchProfile,
      addProfile,
      removeProfile,
      canSendProposal,
      canCreateProfile,
      needsOnboarding,
      completeOnboarding,
      openAuthModal,
      closeAuthModal,
      authModalOpen,
      authModalMode,
      refreshAccount,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
