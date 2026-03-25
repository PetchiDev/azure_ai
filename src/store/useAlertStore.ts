import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { unifiedStorage } from '@/utils/storage';

interface AlertState {
  hasUnreadAlerts: boolean;
  lastCheckedAt: string | null;
  setUnread: (hasUnread: boolean) => void;
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set) => ({
      hasUnreadAlerts: false,
      lastCheckedAt: null,
      setUnread: (hasUnread) => set({ hasUnreadAlerts: hasUnread, lastCheckedAt: new Date().toISOString() }),
    }),
    {
      name: 'alert-storage',
      storage: createJSONStorage(() => unifiedStorage),
    }
  )
);
