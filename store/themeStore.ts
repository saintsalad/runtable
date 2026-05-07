import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ThemePreference } from '@/constants/palettes';
import { mmkvStorage } from '@/store/storage';

interface ThemeSlice {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
}

export const useThemeStore = create<ThemeSlice>()(
  persist(
    (set) => ({
      preference: 'dark',
      setPreference: (p) => set({ preference: p }),
    }),
    {
      name: 'runtable-theme',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
