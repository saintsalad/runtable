import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';

import { createRealtimeEngine } from '@/mocks/realtimeEngine';
import { useRunTableStore } from '@/store';

const engine = createRealtimeEngine(useRunTableStore);

export function useLobbyRealtime(enabled: boolean, hostId: string) {
  const started = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;
      if (started.current) return;
      started.current = true;
      engine.startLobby(hostId);
      return () => {
        started.current = false;
        engine.stopLobby();
      };
    }, [enabled, hostId])
  );
}

export function useLiveRealtime(enabled: boolean, distanceKm: number) {
  const started = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;
      if (started.current) return;
      started.current = true;
      engine.startLive(distanceKm);
      return () => {
        started.current = false;
        engine.stopLive();
      };
    }, [enabled, distanceKm])
  );
}

export function getMockSocket() {
  return engine.socket;
}
