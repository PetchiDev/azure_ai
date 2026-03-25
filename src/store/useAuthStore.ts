import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { unifiedStorage } from '@/utils/storage';

interface AuthState {
  isAuthenticated: boolean;
  tenantId: string | null;
  clientId: string | null;
  subscriptionId: string | null;
  accessToken: string | null;
  user: {
    name: string;
    email: string;
    avatar?: string;
  } | null;
  setCredentials: (creds: { 
    tenantId: string; 
    clientId: string; 
    subscriptionId?: string; 
    accessToken: string;
    user?: { name: string; email: string; avatar?: string; }
  }) => Promise<void>;
  setSubscription: (id: string) => void;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      tenantId: null,
      clientId: null,
      subscriptionId: null,
      accessToken: null,
      user: null,

      setCredentials: async (creds) => {
        const { accessToken, ...rest } = creds;
        if (Platform.OS !== 'web') {
          await SecureStore.setItemAsync('azure_access_token', accessToken);
        } else {
          localStorage.setItem('azure_access_token', accessToken);
        }
        set({ ...rest, accessToken, isAuthenticated: true });
      },

      setSubscription: (id) => set({ subscriptionId: id }),

      logout: async () => {
        if (Platform.OS !== 'web') {
          await SecureStore.deleteItemAsync('azure_access_token');
        } else {
          localStorage.removeItem('azure_access_token');
        }
        set({ 
          isAuthenticated: false, 
          tenantId: null, 
          clientId: null, 
          subscriptionId: null, 
          accessToken: null,
          user: null 
        });
      },

      loadToken: async () => {
        let token: string | null = null;
        if (Platform.OS !== 'web') {
          token = await SecureStore.getItemAsync('azure_access_token');
        } else {
          token = localStorage.getItem('azure_access_token');
        }
        
        if (token) {
          set({ accessToken: token, isAuthenticated: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => unifiedStorage),
      partialize: (state) => ({ 
        tenantId: state.tenantId, 
        clientId: state.clientId, 
        subscriptionId: state.subscriptionId,
        isAuthenticated: state.isAuthenticated,
        user: state.user
      }),
    }
  )
);
