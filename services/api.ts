import { Department, NewsItem, RequestStatus, ServiceRequest, User, UserRole } from "../types";
import { INITIAL_DEPARTMENTS, INITIAL_ADMIN_SEED, MOCK_NEWS } from "../constants";

const STORAGE_KEYS = {
  USERS: 'app_users_v2', // Changed key to force fresh start if needed
  REQUESTS: 'app_requests',
  NEWS: 'app_news',
  DEPARTMENTS: 'app_departments',
  CURRENT_USER: 'app_current_user'
};

// Initialize Helper: Creates the database if it doesn't exist
const initStorage = () => {
  // 1. Setup Users (If empty, create the Initial Admin)
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const adminUser: User = {
      id: 'admin-seed-01',
      phone: INITIAL_ADMIN_SEED.phone,
      password: INITIAL_ADMIN_SEED.password,
      fullName: INITIAL_ADMIN_SEED.name,
      role: UserRole.ADMIN,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([adminUser]));
  }

  // 2. Setup News
  if (!localStorage.getItem(STORAGE_KEYS.NEWS)) {
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(MOCK_NEWS));
  }

  // 3. Setup Departments
  if (!localStorage.getItem(STORAGE_KEYS.DEPARTMENTS)) {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
  }

  // 4. Setup Requests
  if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify([]));
  }
};

// Run initialization once
initStorage();

export const api = {
  auth: {
    login: async (phone: string, password: string): Promise<User | null> => {
      await new Promise(r => setTimeout(r, 600)); // Simulate network
      
      // Always read from LocalStorage (The Source of Truth)
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      
      // Find matching user
      const user = users.find(u => u.phone === phone && u.password === password);
      
      if (user) {
        // Update session
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        return user;
      }
      return null;
    },

    signup: async (userData: Omit<User, 'id' | 'role' | 'createdAt'>): Promise<User> => {
      await new Promise(r => setTimeout(r, 600));
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      
      if (users.find(u => u.phone === userData.phone)) {
        throw new Error("رقم الهاتف مستخدم بالفعل");
      }

      const newUser: User = {
        ...userData,
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        role: UserRole.CITIZEN,
        createdAt: new Date().toISOString()
      };
      
      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
      return newUser;
    },

    updateProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
      await new Promise(r => setTimeout(r, 500));
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const index = users.findIndex(u => u.id === userId);
      
      if (index === -1) throw new Error("المستخدم غير موجود");
      
      // Create updated user object
      // IMPORTANT: We filter out empty password strings to prevent accidental overwrites
      const safeUpdates = { ...updates };
      if (safeUpdates.password === '') {
        delete safeUpdates.password;
      }

      const updatedUser = { ...users[index], ...safeUpdates };
      users[index] = updatedUser;
      
      // Save back to storage
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
      
      return updatedUser;
    },

    logout: () => {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    },

    getCurrentUser: (): User | null => {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return stored ? JSON.parse(stored) : null;
    }
  },
  
  requests: {
    getAll: async (): Promise<ServiceRequest[]> => {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
    },
    getByUser: async (userId: string): Promise<ServiceRequest[]> => {
      const all: ServiceRequest[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
      return all.filter(r => r.userId === userId);
    },
    create: async (data: Omit<ServiceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<ServiceRequest> => {
      const all: ServiceRequest[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
      const newRequest: ServiceRequest = {
        ...data,
        id: 'req-' + Math.random().toString(36).substr(2, 9),
        status: RequestStatus.SENT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      all.push(newRequest);
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(all));
      return newRequest;
    },
    updateStatus: async (id: string, status: string): Promise<void> => {
      const all: ServiceRequest[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
      const index = all.findIndex(r => r.id === id);
      if (index !== -1) {
        all[index].status = status as any;
        all[index].updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(all));
      }
    }
  },

  news: {
    getAll: async (): Promise<NewsItem[]> => {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.NEWS) || '[]');
    },
    create: async (item: Omit<NewsItem, 'id' | 'createdAt'>): Promise<NewsItem> => {
      const all: NewsItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NEWS) || '[]');
      const newItem: NewsItem = {
        ...item,
        id: 'news-' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      };
      all.unshift(newItem); // Add to top
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(all));
      return newItem;
    },
    delete: async (id: string): Promise<void> => {
      let all: NewsItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NEWS) || '[]');
      all = all.filter(n => n.id !== id);
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(all));
    }
  },

  departments: {
    getAll: async (): Promise<Department[]> => {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.DEPARTMENTS) || '[]');
    },
    add: async (name: string): Promise<Department> => {
      const all: Department[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEPARTMENTS) || '[]');
      const newDept = { id: 'dept-' + Math.random().toString(36).substr(2, 9), name };
      all.push(newDept);
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(all));
      return newDept;
    },
    delete: async (id: string): Promise<void> => {
      let all: Department[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEPARTMENTS) || '[]');
      all = all.filter(d => d.id !== id);
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(all));
    }
  }
};
