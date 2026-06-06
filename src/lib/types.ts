// Core types for Palco Conectado multi-profile system

// =============================================================================
// PROFILE TYPES
// =============================================================================

export type ProfileType = 'artista_independente' | 'banda' | 'contratante';

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise';

export type ExperienceLevel = 'iniciante' | 'intermediario' | 'profissional';

export type AvailabilityStatus = 'disponivel' | 'ocupado' | 'parcial';

export type LookingForType = 'banda' | 'freelance' | 'ambos';

export type ProposalStatus = 'pending' | 'accepted' | 'rejected';

export type MessageType = 'text' | 'proposal' | 'collaboration';

export type MessageStatus = 'sent' | 'read' | 'replied';

export type ConversationType = 'show_proposal' | 'collaboration' | 'general';

export type CollaborationType = 'vaga_banda' | 'projeto_pontual' | 'substituicao';

// =============================================================================
// USER ACCOUNT & PROFILES
// =============================================================================

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  expiresAt?: string;
  features: string[];
}

export interface UserProfile {
  id: string;
  type: ProfileType;
  entityId: string; // Links to Musician, Band, or Establishment
  role?: 'owner' | 'member';
  createdAt: string;
}

export interface UserAccount {
  id: string;
  email: string;
  password: string; // In real app, this would be hashed
  name: string;
  avatarUrl?: string;

  // Multi-profile support
  profiles: UserProfile[];
  activeProfileId: string | null;

  // Subscription
  subscription: SubscriptionPlan;
  proposalsUsed: number;
  proposalsLimit: number;

  // Timestamps
  lastLoginAt: string;
  createdAt: string;
}

export interface SessionData {
  token: string;
  accountId: string;
  activeProfileId: string | null;
  createdAt: string;
  expiresAt: string;
}

// =============================================================================
// ENTITIES: MUSICIAN, BAND, ESTABLISHMENT
// =============================================================================

export interface Musician {
  id: string;
  userId: string;
  name: string;
  instruments: string[];
  genres: string[];
  experience: ExperienceLevel;
  location: string;
  bio: string;
  availability: AvailabilityStatus;
  lookingFor: LookingForType;
  pricePerGig?: string;
  portfolioLinks?: string[];
  image?: string;
  rating: number;
  totalGigs: number;
  createdAt: string;
}

export interface Band {
  id: string;
  userId: string;
  name: string;
  genre: string;
  description: string;
  location: string;
  members: number;
  priceRange: string;
  image?: string;
  rating: number;
  totalShows: number;
  createdAt: string;
}

export interface Establishment {
  id: string;
  userId: string;
  name: string;
  type: string;
  description: string;
  location: string;
  capacity: number;
  averageBudget: string;
  image?: string;
  rating: number;
  totalEvents: number;
  createdAt: string;
}

// =============================================================================
// MESSAGING SYSTEM
// =============================================================================

export interface ProposalData {
  eventDate: string;
  amount: number;
  duration: string;
  notes?: string;
}

export interface CollaborationData {
  type: CollaborationType;
  instrument?: string;
  description: string;
  compensation?: string;
  startDate?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  fromProfileId: string;
  fromProfileType: ProfileType;
  toProfileId: string;
  toProfileType: ProfileType;
  content: string;
  type: MessageType;
  proposalData?: ProposalData;
  collaborationData?: CollaborationData;
  status: MessageStatus;
  createdAt: string;
}

export interface ConversationParticipant {
  profileId: string;
  profileType: ProfileType;
  name: string;
  image?: string;
}

export interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  type: ConversationType;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// LEGACY TYPES (for backward compatibility during migration)
// =============================================================================

export interface LegacyProposal {
  id: string;
  fromId: string;
  toId: string;
  eventDate: string;
  message: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Event {
  id: string;
  establishmentId: string;
  title: string;
  date: string;
  description: string;
  budget: number;
  status: 'open' | 'filled';
}

export interface Availability {
  id: string;
  bandId: string;
  date: string;
  available: boolean;
}

// =============================================================================
// HELPER TYPE UTILITIES
// =============================================================================

export type EntityType = Musician | Band | Establishment;

export function getProfileTypeName(type: ProfileType): string {
  const names: Record<ProfileType, string> = {
    artista_independente: 'Artista Independente',
    banda: 'Banda',
    contratante: 'Contratante',
  };
  return names[type];
}

export function getProfileTypeIcon(type: ProfileType): string {
  const icons: Record<ProfileType, string> = {
    artista_independente: '🎸',
    banda: '🎵',
    contratante: '🏢',
  };
  return icons[type];
}
