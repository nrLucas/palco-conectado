// Mock data management system
export interface User {
  id: string;
  email: string;
  type: 'band' | 'establishment';
  name: string;
  subscriptionPlan?: 'free' | 'basic' | 'premium';
  proposalsUsed?: number;
  proposalsLimit?: number;
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

// Initialize mock users if not exists
if (!localStorage.getItem(STORAGE_KEYS.users)) {
  const mockUsers: User[] = [
    {
      id: 'band-1',
      email: 'aurora@band.com',
      type: 'band',
      name: 'Aurora Band',
      subscriptionPlan: 'premium',
      proposalsUsed: 1,
      proposalsLimit: 20
    },
    {
      id: 'establishment-1',
      email: 'bar@aurora.com',
      type: 'establishment',
      name: 'Bar Aurora'
    }
  ];
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(mockUsers));
}