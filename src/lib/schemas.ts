import { z } from 'zod';

// =============================================================================
// PROFILE & AUTH SCHEMAS
// =============================================================================

export const subscriptionPlanSchema = z.object({
  tier: z.enum(['free', 'basic', 'premium', 'enterprise']),
  expiresAt: z.string().optional(),
  features: z.array(z.string()),
});

export const userProfileSchema = z.object({
  id: z.string(),
  type: z.enum(['artista_independente', 'banda', 'contratante']),
  entityId: z.string(),
  role: z.enum(['owner', 'member']).optional(),
  createdAt: z.string(),
});

export const userAccountSchema = z.object({
  id: z.string(),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
  name: z.string().min(2, 'Informe seu nome'),
  avatarUrl: z.string().optional(),
  profiles: z.array(userProfileSchema),
  activeProfileId: z.string().nullable(),
  subscription: subscriptionPlanSchema,
  proposalsUsed: z.number(),
  proposalsLimit: z.number(),
  lastLoginAt: z.string(),
  createdAt: z.string(),
});

export const sessionDataSchema = z.object({
  token: z.string(),
  accountId: z.string(),
  activeProfileId: z.string().nullable(),
  createdAt: z.string(),
  expiresAt: z.string(),
});

// =============================================================================
// ENTITY SCHEMAS
// =============================================================================

export const musicianSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(2, 'Nome é obrigatório'),
  instruments: z.array(z.string()).min(1, 'Selecione ao menos um instrumento'),
  genres: z.array(z.string()).min(1, 'Selecione ao menos um gênero'),
  experience: z.enum(['iniciante', 'intermediario', 'profissional']),
  location: z.string().min(3, 'Localização é obrigatória'),
  bio: z.string().max(500, 'Máximo de 500 caracteres'),
  availability: z.enum(['disponivel', 'ocupado', 'parcial']),
  lookingFor: z.enum(['banda', 'freelance', 'ambos']),
  pricePerGig: z.string().optional(),
  portfolioLinks: z.array(z.string().url()).optional(),
  image: z.string().optional(),
  rating: z.number().min(0).max(5),
  totalGigs: z.number().min(0),
  createdAt: z.string(),
});

export const bandSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(2, 'Nome da banda é obrigatório'),
  genre: z.string().min(2, 'Gênero é obrigatório'),
  description: z.string().max(1000, 'Máximo de 1000 caracteres'),
  location: z.string().min(3, 'Localização é obrigatória'),
  members: z.number().min(1, 'Mínimo de 1 membro'),
  priceRange: z.string(),
  image: z.string().optional(),
  rating: z.number().min(0).max(5),
  totalShows: z.number().min(0),
  createdAt: z.string(),
});

export const establishmentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(2, 'Nome do estabelecimento é obrigatório'),
  type: z.string().min(2, 'Tipo é obrigatório'),
  description: z.string().max(1000, 'Máximo de 1000 caracteres'),
  location: z.string().min(3, 'Localização é obrigatória'),
  capacity: z.number().min(1, 'Capacidade mínima de 1'),
  averageBudget: z.string(),
  image: z.string().optional(),
  rating: z.number().min(0).max(5),
  totalEvents: z.number().min(0),
  createdAt: z.string(),
});

// =============================================================================
// MESSAGING SCHEMAS
// =============================================================================

export const proposalDataSchema = z.object({
  eventDate: z.string(),
  amount: z.number().min(0, 'Valor deve ser maior que zero'),
  duration: z.string(),
  notes: z.string().optional(),
});

export const collaborationDataSchema = z.object({
  type: z.enum(['vaga_banda', 'projeto_pontual', 'substituicao']),
  instrument: z.string().optional(),
  description: z.string().min(10, 'Descreva a proposta'),
  compensation: z.string().optional(),
  startDate: z.string().optional(),
});

export const messageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  fromProfileId: z.string(),
  fromProfileType: z.enum(['artista_independente', 'banda', 'contratante']),
  toProfileId: z.string(),
  toProfileType: z.enum(['artista_independente', 'banda', 'contratante']),
  content: z.string().min(1, 'Mensagem não pode estar vazia'),
  type: z.enum(['text', 'proposal', 'collaboration']),
  proposalData: proposalDataSchema.optional(),
  collaborationData: collaborationDataSchema.optional(),
  status: z.enum(['sent', 'read', 'replied']),
  createdAt: z.string(),
});

export const conversationParticipantSchema = z.object({
  profileId: z.string(),
  profileType: z.enum(['artista_independente', 'banda', 'contratante']),
  name: z.string(),
  image: z.string().optional(),
});

export const conversationSchema = z.object({
  id: z.string(),
  participants: z.array(conversationParticipantSchema).min(2),
  type: z.enum(['show_proposal', 'collaboration', 'general']),
  lastMessage: messageSchema.optional(),
  unreadCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// =============================================================================
// FORM INPUT SCHEMAS (for user input validation)
// =============================================================================

export const loginFormSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
});

export const signupFormSchema = loginFormSchema.extend({
  name: z.string().min(2, 'Informe seu nome'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

export const musicianFormSchema = musicianSchema.omit({
  id: true,
  userId: true,
  rating: true,
  totalGigs: true,
  createdAt: true,
});

export const bandFormSchema = bandSchema.omit({
  id: true,
  userId: true,
  rating: true,
  totalShows: true,
  createdAt: true,
});

export const establishmentFormSchema = establishmentSchema.omit({
  id: true,
  userId: true,
  rating: true,
  totalEvents: true,
  createdAt: true,
});

export const proposalFormSchema = z.object({
  eventDate: z.date({ required_error: 'Selecione uma data' }),
  amount: z.number().min(1, 'Informe o valor'),
  duration: z.string().min(1, 'Informe a duração'),
  notes: z.string().optional(),
});

export const collaborationFormSchema = z.object({
  type: z.enum(['vaga_banda', 'projeto_pontual', 'substituicao']),
  instrument: z.string().optional(),
  description: z.string().min(10, 'Descreva a proposta (mínimo 10 caracteres)'),
  compensation: z.string().optional(),
  startDate: z.date().optional(),
});

// =============================================================================
// TYPE EXPORTS FROM SCHEMAS
// =============================================================================

export type LoginFormData = z.infer<typeof loginFormSchema>;
export type SignupFormData = z.infer<typeof signupFormSchema>;
export type MusicianFormData = z.infer<typeof musicianFormSchema>;
export type BandFormData = z.infer<typeof bandFormSchema>;
export type EstablishmentFormData = z.infer<typeof establishmentFormSchema>;
export type ProposalFormData = z.infer<typeof proposalFormSchema>;
export type CollaborationFormData = z.infer<typeof collaborationFormSchema>;
