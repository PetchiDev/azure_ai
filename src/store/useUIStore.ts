import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ColorSchemeName } from 'react-native';
import { unifiedStorage } from '@/utils/storage';

interface UIState {
  themeMode: 'light' | 'dark' | 'system';
  preferredColorScheme: ColorSchemeName;
  sidebarCollapsed: boolean;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      preferredColorScheme: 'dark', // Default to dark for this app's aesthetic

      sidebarCollapsed: false,
      setThemeMode: (mode) => set({ themeMode: mode }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => unifiedStorage),
    }
  )
);
