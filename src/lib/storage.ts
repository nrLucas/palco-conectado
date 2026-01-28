import type {
    Availability,
    Band,
    Conversation,
    Establishment,
    Event,
    LegacyProposal,
    Message,
    Musician,
    SessionData,
    UserAccount,
} from './types';

// =============================================================================
// STORAGE KEYS
// =============================================================================

export const STORAGE_KEYS = {
  // Session & Auth
  session: 'palco_session',
  accounts: 'palco_accounts',

  // Profile Entities
  musicians: 'palco_musicians',
  bands: 'palco_bands',
  establishments: 'palco_establishments',

  // Messaging
  conversations: 'palco_conversations',
  messages: 'palco_messages',

  // Legacy (for backward compatibility)
  proposals: 'palco_proposals',
  events: 'palco_events',
  availability: 'palco_availability',

  // Migration flags
  migrated: 'palco_data_migrated',
} as const;

// =============================================================================
// STORAGE MANAGER CLASS
// =============================================================================

class StorageManager {
  // ---------------------------------------------------------------------------
  // Generic Methods
  // ---------------------------------------------------------------------------

  private get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save to localStorage: ${key}`, error);
    }
  }

  private remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }

  // ---------------------------------------------------------------------------
  // Session Management
  // ---------------------------------------------------------------------------

  getSession(): SessionData | null {
    const session = this.get<SessionData | null>(STORAGE_KEYS.session, null);
    if (session && new Date(session.expiresAt) < new Date()) {
      this.clearSession();
      return null;
    }
    return session;
  }

  setSession(session: SessionData): void {
    this.set(STORAGE_KEYS.session, session);
  }

  clearSession(): void {
    this.remove(STORAGE_KEYS.session);
  }

  createSession(accountId: string, activeProfileId: string | null): SessionData {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session: SessionData = {
      token: `session_${accountId}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      accountId,
      activeProfileId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    this.setSession(session);
    return session;
  }

  // ---------------------------------------------------------------------------
  // Account Management
  // ---------------------------------------------------------------------------

  getAccounts(): UserAccount[] {
    return this.get<UserAccount[]>(STORAGE_KEYS.accounts, []);
  }

  getAccountById(id: string): UserAccount | null {
    return this.getAccounts().find(a => a.id === id) || null;
  }

  getAccountByEmail(email: string): UserAccount | null {
    return this.getAccounts().find(a => a.email.toLowerCase() === email.toLowerCase()) || null;
  }

  saveAccount(account: UserAccount): void {
    const accounts = this.getAccounts();
    const index = accounts.findIndex(a => a.id === account.id);
    if (index >= 0) {
      accounts[index] = account;
    } else {
      accounts.push(account);
    }
    this.set(STORAGE_KEYS.accounts, accounts);
  }

  createAccount(email: string, password: string, name: string): UserAccount {
    const now = new Date().toISOString();
    const account: UserAccount = {
      id: `account-${Date.now()}`,
      email,
      password, // In production, hash this
      name,
      avatarUrl: undefined,
      profiles: [],
      activeProfileId: null,
      subscription: {
        tier: 'free',
        features: ['2_proposals_month', 'basic_profile'],
      },
      proposalsUsed: 0,
      proposalsLimit: 2,
      lastLoginAt: now,
      createdAt: now,
    };
    this.saveAccount(account);
    return account;
  }

  updateAccountProfile(accountId: string, activeProfileId: string): void {
    const account = this.getAccountById(accountId);
    if (account) {
      account.activeProfileId = activeProfileId;
      this.saveAccount(account);

      const session = this.getSession();
      if (session && session.accountId === accountId) {
        session.activeProfileId = activeProfileId;
        this.setSession(session);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Musicians
  // ---------------------------------------------------------------------------

  getMusicians(): Musician[] {
    return this.get<Musician[]>(STORAGE_KEYS.musicians, []);
  }

  getMusicianById(id: string): Musician | null {
    return this.getMusicians().find(m => m.id === id) || null;
  }

  getMusiciansByUser(userId: string): Musician[] {
    return this.getMusicians().filter(m => m.userId === userId);
  }

  saveMusician(musician: Musician): void {
    const musicians = this.getMusicians();
    const index = musicians.findIndex(m => m.id === musician.id);
    if (index >= 0) {
      musicians[index] = musician;
    } else {
      musicians.push(musician);
    }
    this.set(STORAGE_KEYS.musicians, musicians);
  }

  deleteMusician(id: string): void {
    const musicians = this.getMusicians().filter(m => m.id !== id);
    this.set(STORAGE_KEYS.musicians, musicians);
  }

  // ---------------------------------------------------------------------------
  // Bands
  // ---------------------------------------------------------------------------

  getBands(): Band[] {
    return this.get<Band[]>(STORAGE_KEYS.bands, []);
  }

  getBandById(id: string): Band | null {
    return this.getBands().find(b => b.id === id) || null;
  }

  getBandsByUser(userId: string): Band[] {
    return this.getBands().filter(b => b.userId === userId);
  }

  saveBand(band: Band): void {
    const bands = this.getBands();
    const index = bands.findIndex(b => b.id === band.id);
    if (index >= 0) {
      bands[index] = band;
    } else {
      bands.push(band);
    }
    this.set(STORAGE_KEYS.bands, bands);
  }

  deleteBand(id: string): void {
    const bands = this.getBands().filter(b => b.id !== id);
    this.set(STORAGE_KEYS.bands, bands);
  }

  // ---------------------------------------------------------------------------
  // Establishments
  // ---------------------------------------------------------------------------

  getEstablishments(): Establishment[] {
    return this.get<Establishment[]>(STORAGE_KEYS.establishments, []);
  }

  getEstablishmentById(id: string): Establishment | null {
    return this.getEstablishments().find(e => e.id === id) || null;
  }

  getEstablishmentsByUser(userId: string): Establishment[] {
    return this.getEstablishments().filter(e => e.userId === userId);
  }

  saveEstablishment(establishment: Establishment): void {
    const establishments = this.getEstablishments();
    const index = establishments.findIndex(e => e.id === establishment.id);
    if (index >= 0) {
      establishments[index] = establishment;
    } else {
      establishments.push(establishment);
    }
    this.set(STORAGE_KEYS.establishments, establishments);
  }

  deleteEstablishment(id: string): void {
    const establishments = this.getEstablishments().filter(e => e.id !== id);
    this.set(STORAGE_KEYS.establishments, establishments);
  }

  // ---------------------------------------------------------------------------
  // Conversations & Messages
  // ---------------------------------------------------------------------------

  getConversations(): Conversation[] {
    return this.get<Conversation[]>(STORAGE_KEYS.conversations, []);
  }

  getConversationById(id: string): Conversation | null {
    return this.getConversations().find(c => c.id === id) || null;
  }

  getConversationsByProfile(profileId: string): Conversation[] {
    return this.getConversations().filter(c =>
      c.participants.some(p => p.profileId === profileId)
    );
  }

  saveConversation(conversation: Conversation): void {
    const conversations = this.getConversations();
    const index = conversations.findIndex(c => c.id === conversation.id);
    if (index >= 0) {
      conversations[index] = conversation;
    } else {
      conversations.push(conversation);
    }
    this.set(STORAGE_KEYS.conversations, conversations);
  }

  getMessages(): Message[] {
    return this.get<Message[]>(STORAGE_KEYS.messages, []);
  }

  getMessagesByConversation(conversationId: string): Message[] {
    return this.getMessages()
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  saveMessage(message: Message): void {
    const messages = this.getMessages();
    messages.push(message);
    this.set(STORAGE_KEYS.messages, messages);

    // Update conversation's lastMessage
    const conversation = this.getConversationById(message.conversationId);
    if (conversation) {
      conversation.lastMessage = message;
      conversation.updatedAt = message.createdAt;
      this.saveConversation(conversation);
    }
  }

  // ---------------------------------------------------------------------------
  // Legacy Methods (backward compatibility)
  // ---------------------------------------------------------------------------

  getLegacyProposals(): LegacyProposal[] {
    return this.get<LegacyProposal[]>(STORAGE_KEYS.proposals, []);
  }

  saveLegacyProposal(proposal: LegacyProposal): void {
    const proposals = this.getLegacyProposals();
    proposals.push(proposal);
    this.set(STORAGE_KEYS.proposals, proposals);
  }

  updateLegacyProposal(id: string, updates: Partial<LegacyProposal>): void {
    const proposals = this.getLegacyProposals();
    const index = proposals.findIndex(p => p.id === id);
    if (index >= 0) {
      proposals[index] = { ...proposals[index], ...updates };
      this.set(STORAGE_KEYS.proposals, proposals);
    }
  }

  getEvents(): Event[] {
    return this.get<Event[]>(STORAGE_KEYS.events, []);
  }

  saveEvent(event: Event): void {
    const events = this.getEvents();
    events.push(event);
    this.set(STORAGE_KEYS.events, events);
  }

  getAvailability(): Availability[] {
    return this.get<Availability[]>(STORAGE_KEYS.availability, []);
  }

  saveAvailability(availability: Availability): void {
    const availabilities = this.getAvailability();
    const index = availabilities.findIndex(
      a => a.bandId === availability.bandId && a.date === availability.date
    );
    if (index >= 0) {
      availabilities[index] = availability;
    } else {
      availabilities.push(availability);
    }
    this.set(STORAGE_KEYS.availability, availabilities);
  }

  // ---------------------------------------------------------------------------
  // Data Migration
  // ---------------------------------------------------------------------------

  isMigrated(): boolean {
    return this.get<boolean>(STORAGE_KEYS.migrated, false);
  }

  setMigrated(): void {
    this.set(STORAGE_KEYS.migrated, true);
  }

  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => this.remove(key));
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const storage = new StorageManager();
