// Mock data management system
export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionPlan?: 'free' | 'basic' | 'premium';
  proposalsUsed?: number;
  proposalsLimit?: number;
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
}

export interface Proposal {
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

// Local storage keys
const STORAGE_KEYS = {
  currentUser: 'palcomatch_current_user',
  users: 'palcomatch_users',
  bands: 'palcomatch_bands',
  establishments: 'palcomatch_establishments',
  proposals: 'palcomatch_proposals',
  events: 'palcomatch_events',
  availability: 'palcomatch_availability'
};

// Mock data management class
class MockDataManager {
  getCurrentUser(): User | null {
    const userData = localStorage.getItem(STORAGE_KEYS.currentUser);
    return userData ? JSON.parse(userData) : null;
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.currentUser);
    }
  }

  getUsers(): User[] {
    const users = localStorage.getItem(STORAGE_KEYS.users);
    return users ? JSON.parse(users) : [];
  }

  saveUser(user: User): void {
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }

  createUser(email: string, password: string, name: string): User {
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      subscriptionPlan: 'free',
      proposalsUsed: 0,
      proposalsLimit: 2
    };
    this.saveUser(newUser);
    return newUser;
  }

  getBands(): Band[] {
    const bands = localStorage.getItem(STORAGE_KEYS.bands);
    return bands ? JSON.parse(bands) : [];
  }

  saveBand(band: Band): void {
    const bands = this.getBands();
    const existingIndex = bands.findIndex(b => b.id === band.id);
    if (existingIndex >= 0) {
      bands[existingIndex] = band;
    } else {
      bands.push(band);
    }
    localStorage.setItem(STORAGE_KEYS.bands, JSON.stringify(bands));
  }

  getEstablishments(): Establishment[] {
    const establishments = localStorage.getItem(STORAGE_KEYS.establishments);
    return establishments ? JSON.parse(establishments) : [];
  }

  saveEstablishment(establishment: Establishment): void {
    const establishments = this.getEstablishments();
    const existingIndex = establishments.findIndex(e => e.id === establishment.id);
    if (existingIndex >= 0) {
      establishments[existingIndex] = establishment;
    } else {
      establishments.push(establishment);
    }
    localStorage.setItem(STORAGE_KEYS.establishments, JSON.stringify(establishments));
  }

  getUserBands(userId: string): Band[] {
    return this.getBands().filter(band => band.userId === userId);
  }

  getUserEstablishments(userId: string): Establishment[] {
    return this.getEstablishments().filter(est => est.userId === userId);
  }

  getProposals(): Proposal[] {
    const proposals = localStorage.getItem(STORAGE_KEYS.proposals);
    return proposals ? JSON.parse(proposals) : [];
  }

  saveProposal(proposal: Proposal): void {
    const proposals = this.getProposals();
    proposals.push(proposal);
    localStorage.setItem(STORAGE_KEYS.proposals, JSON.stringify(proposals));
  }

  getEvents(): Event[] {
    const events = localStorage.getItem(STORAGE_KEYS.events);
    return events ? JSON.parse(events) : [];
  }

  saveEvent(event: Event): void {
    const events = this.getEvents();
    events.push(event);
    localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
  }

  getAvailability(): Availability[] {
    const availability = localStorage.getItem(STORAGE_KEYS.availability);
    return availability ? JSON.parse(availability) : [];
  }

  saveAvailability(availability: Availability): void {
    const availabilities = this.getAvailability();
    const existingIndex = availabilities.findIndex(a => a.bandId === availability.bandId && a.date === availability.date);
    if (existingIndex >= 0) {
      availabilities[existingIndex] = availability;
    } else {
      availabilities.push(availability);
    }
    localStorage.setItem(STORAGE_KEYS.availability, JSON.stringify(availabilities));
  }

  updateProposal(proposalId: string, updates: Partial<Proposal>): void {
    const proposals = this.getProposals();
    const index = proposals.findIndex(p => p.id === proposalId);
    if (index >= 0) {
      proposals[index] = { ...proposals[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.proposals, JSON.stringify(proposals));
    }
  }
}

export const mockDataManager = new MockDataManager();

// Initialize mock data if not exists
if (!localStorage.getItem(STORAGE_KEYS.users)) {
  const mockUsers: User[] = [
    {
      id: 'user-1',
      email: 'demo@palcomatch.com',
      name: 'Demo User',
      subscriptionPlan: 'premium',
      proposalsUsed: 1,
      proposalsLimit: 20
    }
  ];
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(mockUsers));
}

if (!localStorage.getItem(STORAGE_KEYS.bands)) {
  const mockBands: Band[] = [
    {
      id: 'band-1',
      userId: 'user-1',
      name: 'Aurora Band',
      genre: 'Rock Alternativo',
      description: 'Banda de rock alternativo com mais de 10 anos de estrada',
      location: 'São Paulo, SP',
      members: 4,
      priceRange: 'R$ 1.500 - R$ 3.000',
      rating: 4.8,
      totalShows: 150
    },
    {
      id: 'band-2',
      userId: 'user-2',
      name: 'Neon Dreams',
      genre: 'Eletrônico',
      description: 'DJ set com música eletrônica para todas as idades',
      location: 'Rio de Janeiro, RJ',
      members: 2,
      priceRange: 'R$ 800 - R$ 2.000',
      rating: 4.5,
      totalShows: 80
    }
  ];
  localStorage.setItem(STORAGE_KEYS.bands, JSON.stringify(mockBands));
}

if (!localStorage.getItem(STORAGE_KEYS.establishments)) {
  const mockEstablishments: Establishment[] = [
    {
      id: 'est-1',
      userId: 'user-1',
      name: 'Bar Aurora',
      type: 'Bar',
      description: 'Bar temático com palco para shows ao vivo',
      location: 'Vila Madalena, São Paulo',
      capacity: 100,
      averageBudget: 'R$ 2.000 - R$ 5.000',
      rating: 4.6,
      totalEvents: 120
    },
    {
      id: 'est-2',
      userId: 'user-3',
      name: 'Café Cultural',
      type: 'Café',
      description: 'Espaço cultural com música ao vivo',
      location: 'Centro, Rio de Janeiro',
      capacity: 50,
      averageBudget: 'R$ 800 - R$ 2.500',
      rating: 4.3,
      totalEvents: 90
    }
  ];
  localStorage.setItem(STORAGE_KEYS.establishments, JSON.stringify(mockEstablishments));
}