import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  tenantId: string | null;
  clientId: string | null;
  subscriptionId: string | null;
  accessToken: string | null;
  setCredentials: (creds: { tenantId: string; clientId: string; subscriptionId?: string; accessToken: string }) => void;
  setSubscription: (id: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  tenantId: null,
  clientId: null,
  subscriptionId: null,
  accessToken: null,
  setCredentials: (creds) => set({ ...creds, isAuthenticated: true }),
  setSubscription: (id) => set({ subscriptionId: id }),
  logout: () => set({ isAuthenticated: false, tenantId: null, clientId: null, subscriptionId: null, accessToken: null }),
}));
