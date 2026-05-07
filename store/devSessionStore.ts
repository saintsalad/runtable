import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { DevMockRole, MapTimeAtmosphere } from '@/types/session';
import { mmkvStorage } from '@/store/storage';

type DevSessionState = {
  devMockRole: DevMockRole;
  setDevMockRole: (r: DevMockRole) => void;
  mapDayPhase: MapTimeAtmosphere;
  setMapDayPhase: (p: MapTimeAtmosphere) => void;
};

export const useDevSessionStore = create<DevSessionState>()(
  persist(
    (set) => ({
      devMockRole: 'auto',
      setDevMockRole: (r) => set({ devMockRole: r }),
      mapDayPhase: 'night',
      setMapDayPhase: (p) => set({ mapDayPhase: p }),
    }),
    {
      name: 'runtable-dev-session',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
