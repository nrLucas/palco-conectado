'use client';

import { toast } from '@/hooks/use-toast';
import { storage } from '@/lib/storage';
import type {
    Band,
    Establishment,
    Musician,
    ProfileType,
    SessionData,
    UserAccount,
    UserProfile,
} from '@/lib/types';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// =============================================================================
// CONTEXT TYPES
// =============================================================================

interface AuthContextValue {
  // Account state
  account: UserAccount | null;
  session: SessionData | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Auth operations
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;

  // Profile management
  activeProfile: UserProfile | null;
  activeEntity: Musician | Band | Establishment | null;
  profiles: UserProfile[];
  switchProfile: (profileId: string) => void;
  addProfile: (type: ProfileType, entityId: string, role?: 'owner' | 'member') => UserProfile;
  removeProfile: (profileId: string) => void;

  // Permission checks
  canSendProposal: () => { allowed: boolean; reason?: string };
  canCreateProfile: () => { allowed: boolean; max: number; current: number };

  // Onboarding
  needsOnboarding: boolean;
  completeOnboarding: () => void;

  // Modal controls
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  authModalOpen: boolean;
  authModalMode: 'login' | 'signup';
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  // Initialize from storage
  useEffect(() => {
    const savedSession = storage.getSession();
    if (savedSession) {
      const savedAccount = storage.getAccountById(savedSession.accountId);
      if (savedAccount) {
        setSession(savedSession);
        setAccount(savedAccount);
      } else {
        storage.clearSession();
      }
    }
    setIsLoading(false);
  }, []);

  // Derived state
  const isAuthenticated = !!account && !!session;
  const profiles = account?.profiles || [];

  const activeProfile = useMemo(() => {
    if (!account?.activeProfileId) return null;
    return profiles.find(p => p.id === account.activeProfileId) || null;
  }, [account?.activeProfileId, profiles]);

  const activeEntity = useMemo(() => {
    if (!activeProfile) return null;
    switch (activeProfile.type) {
      case 'artista_independente':
        return storage.getMusicianById(activeProfile.entityId);
      case 'banda':
        return storage.getBandById(activeProfile.entityId);
      case 'contratante':
        return storage.getEstablishmentById(activeProfile.entityId);
      default:
        return null;
    }
  }, [activeProfile]);

  const needsOnboarding = isAuthenticated && profiles.length === 0;

  // ---------------------------------------------------------------------------
  // Auth Operations
  // ---------------------------------------------------------------------------

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const existingAccount = storage.getAccountByEmail(email);

    if (!existingAccount) {
      toast({
        title: 'Erro no login',
        description: 'E-mail não encontrado',
        variant: 'destructive',
      });
      return false;
    }

    if (existingAccount.password !== password) {
      toast({
        title: 'Erro no login',
        description: 'Senha incorreta',
        variant: 'destructive',
      });
      return false;
    }

    // Update last login
    existingAccount.lastLoginAt = new Date().toISOString();
    storage.saveAccount(existingAccount);

    // Create session
    const newSession = storage.createSession(
      existingAccount.id,
      existingAccount.activeProfileId
    );

    setAccount(existingAccount);
    setSession(newSession);
    setAuthModalOpen(false);

    toast({
      title: 'Login realizado!',
      description: `Bem-vindo(a), ${existingAccount.name}`,
    });

    return true;
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    const existingAccount = storage.getAccountByEmail(email);

    if (existingAccount) {
      toast({
        title: 'Erro no cadastro',
        description: 'Este e-mail já está em uso',
        variant: 'destructive',
      });
      return false;
    }

    const newAccount = storage.createAccount(email, password, name);
    const newSession = storage.createSession(newAccount.id, null);

    setAccount(newAccount);
    setSession(newSession);
    setAuthModalOpen(false);

    toast({
      title: 'Cadastro realizado!',
      description: `Bem-vindo(a), ${newAccount.name}`,
    });

    return true;
  }, []);

  const logout = useCallback(() => {
    storage.clearSession();
    setAccount(null);
    setSession(null);

    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado',
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Profile Management
  // ---------------------------------------------------------------------------

  const switchProfile = useCallback((profileId: string) => {
    if (!account) return;

    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    const updatedAccount = { ...account, activeProfileId: profileId };
    storage.saveAccount(updatedAccount);
    storage.updateAccountProfile(account.id, profileId);
    setAccount(updatedAccount);

    toast({
      title: 'Perfil alterado',
      description: `Agora você está usando: ${getProfileDisplayName(profile)}`,
    });
  }, [account, profiles]);

  const addProfile = useCallback((type: ProfileType, entityId: string, role: 'owner' | 'member' = 'owner'): UserProfile => {
    if (!account) throw new Error('Not authenticated');

    const newProfile: UserProfile = {
      id: `profile-${Date.now()}`,
      type,
      entityId,
      role,
      createdAt: new Date().toISOString(),
    };

    const updatedAccount = {
      ...account,
      profiles: [...account.profiles, newProfile],
      activeProfileId: account.activeProfileId || newProfile.id,
    };

    storage.saveAccount(updatedAccount);
    setAccount(updatedAccount);

    return newProfile;
  }, [account]);

  const removeProfile = useCallback((profileId: string) => {
    if (!account) return;

    const updatedProfiles = account.profiles.filter(p => p.id !== profileId);
    const updatedAccount = {
      ...account,
      profiles: updatedProfiles,
      activeProfileId: account.activeProfileId === profileId
        ? (updatedProfiles[0]?.id || null)
        : account.activeProfileId,
    };

    storage.saveAccount(updatedAccount);
    setAccount(updatedAccount);
  }, [account]);

  const completeOnboarding = useCallback(() => {
    // Just refresh account state - profile should have been added
    if (account) {
      const refreshed = storage.getAccountById(account.id);
      if (refreshed) setAccount(refreshed);
    }
  }, [account]);

  // ---------------------------------------------------------------------------
  // Permission Checks
  // ---------------------------------------------------------------------------

  const canSendProposal = useCallback(() => {
    if (!account) {
      return { allowed: false, reason: 'Faça login para enviar propostas' };
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

    const max = limits[account?.subscription.tier || 'free'] || 2;
    const current = profiles.length;

    return {
      allowed: current < max,
      max,
      current,
    };
  }, [account, profiles.length]);

  // ---------------------------------------------------------------------------
  // Modal Controls
  // ---------------------------------------------------------------------------

  const openAuthModal = useCallback((mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  // ---------------------------------------------------------------------------
  // Context Value
  // ---------------------------------------------------------------------------

  const value = useMemo<AuthContextValue>(() => ({
    account,
    session,
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
  }), [
    account,
    session,
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
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// =============================================================================
// HELPERS
// =============================================================================

function getProfileDisplayName(profile: UserProfile): string {
  switch (profile.type) {
    case 'artista_independente': {
      const musician = storage.getMusicianById(profile.entityId);
      return musician?.name || 'Artista';
    }
    case 'banda': {
      const band = storage.getBandById(profile.entityId);
      return band?.name || 'Banda';
    }
    case 'contratante': {
      const establishment = storage.getEstablishmentById(profile.entityId);
      return establishment?.name || 'Estabelecimento';
    }
    default:
      return 'Perfil';
  }
}
