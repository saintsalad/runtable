import { FREE_TIER_MAX_PARTICIPANTS } from '@/constants/runtable';
import { colorForName, mockFullName, randomPaceZone } from '@/mocks/fixtures';
import type { Participant } from '@/types';

import type { RunTableStore } from '@/store';

type Listener = (...args: unknown[]) => void;

/** Socket-like local bus for future `io()` swap */
export function createMockSocket() {
  const handlers = new Map<string, Set<Listener>>();

  return {
    on(ev: string, fn: Listener) {
      if (!handlers.has(ev)) handlers.set(ev, new Set());
      handlers.get(ev)!.add(fn);
      return this;
    },
    off(ev: string, fn: Listener) {
      handlers.get(ev)?.delete(fn);
      return this;
    },
    emit(ev: string, ...payload: unknown[]) {
      handlers.get(ev)?.forEach((fn) => fn(...payload));
    },
  };
}

let lobbyInterval: ReturnType<typeof setInterval> | null = null;
let liveInterval: ReturnType<typeof setInterval> | null = null;

export function stopLobbySimulation() {
  if (lobbyInterval) clearInterval(lobbyInterval);
  lobbyInterval = null;
}

export function stopLiveSimulation() {
  if (liveInterval) clearInterval(liveInterval);
  liveInterval = null;
}

export function startLobbySimulation(getStore: () => RunTableStore, hostId: string) {
  stopLobbySimulation();
  let seed = 100;

  lobbyInterval = setInterval(() => {
    const store = getStore();
    const { participants, maxParticipants } = store;
    if (participants.length >= Math.min(maxParticipants, FREE_TIER_MAX_PARTICIPANTS)) return;
    seed += 1;
    const name = mockFullName(seed);
    const newbie: Participant = {
      id: `mock-${seed}`,
      name,
      avatarColor: colorForName(name),
      paceZone: randomPaceZone(seed),
      isHost: false,
      isReady: seed % 3 === 0,
    };
    store.addParticipant(newbie);
  }, 3200);
}

export function startLiveSimulation(getStore: () => RunTableStore, targetDistanceKm: number) {
  stopLiveSimulation();
  let tick = 0;

  liveInterval = setInterval(() => {
    const store = getStore();
    if (store.paused) return;
    tick += 1;
    store.tickLiveRun({ tickIndex: tick, targetDistanceKm });
    if (tick % 4 === 0 && Math.random() < 0.45) {
      const cheers = ['◇', '◆', '▓', '▪', '¦', '¤'];
      const g = cheers[tick % cheers.length] ?? '◇';
      store.addCheer(g);
    }
  }, 600);
}

/** Bridge React usage: pass zustand store reference */
export function createRealtimeEngine(storeRef: { getState: () => RunTableStore }) {
  const socket = createMockSocket();
  return {
    socket,
    startLobby: (hostId: string) => startLobbySimulation(() => storeRef.getState(), hostId),
    stopLobby: stopLobbySimulation,
    startLive: (distanceKm: number) => startLiveSimulation(() => storeRef.getState(), distanceKm),
    stopLive: stopLiveSimulation,
  };
}

export function seedHostParticipant(hostId: string, name: string): Participant {
  return {
    id: hostId,
    name,
    avatarColor: colorForName(name),
    paceZone: 'moderate',
    isHost: true,
    isReady: true,
  };
}

export function demoParticipants(host: Participant, count: number): Participant[] {
  const list: Participant[] = [host];
  for (let i = 1; i < count; i += 1) {
    const seed = 40 + i * 9;
    const name = mockFullName(seed);
    list.push({
      id: `p-${seed}`,
      name,
      avatarColor: colorForName(name),
      paceZone: randomPaceZone(seed),
      isHost: false,
      isReady: i % 2 === 0,
    });
  }
  return list;
}
