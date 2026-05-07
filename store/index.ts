import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { buildInitialLeaderboard, nextProgressTick } from '@/mocks/fakeProgress';
import { mmkvStorage } from '@/store/storage';
import type {
  CheerEvent,
  LeaderboardEntry,
  MockUser,
  Participant,
  Receipt,
  RunListing,
} from '@/types';

export type DraftRun = {
  routeName: string;
  distanceKm: number;
  paceZone: import('@/types').PaceZone;
  maxParticipants: number;
  startLabel: string;
  isPublic: boolean;
};

export interface RunTableState {
  authUser: MockUser;
  setAuthUser: (partial: Partial<MockUser>) => void;

  draftRun: DraftRun | null;
  setDraftRun: (draft: DraftRun | null) => void;

  currentRunId: string | null;
  currentRouteName: string;
  currentDistanceKm: number;
  currentPolylineId: string;
  lobbyHostId: string;
  maxParticipants: number;
  participants: Participant[];
  setLobbyFromListing: (listing: RunListing, host: Participant) => void;
  seedNewRun: (args: {
    runId: string;
    routeName: string;
    distanceKm: number;
    maxParticipants: number;
    host: Participant;
    polylineId?: string;
  }) => void;
  resetLobby: () => void;
  addParticipant: (p: Participant) => void;
  toggleReady: (id: string) => void;

  elapsedMs: number;
  paused: boolean;
  currentPaceLabel: string;
  leaderboard: LeaderboardEntry[];
  packPositions: Record<string, number>;
  cheerEvents: CheerEvent[];
  startActiveRun: (args: { paceLabel: string; participants: Participant[]; distanceKm: number }) => void;
  tickLiveRun: (args: { tickIndex: number; targetDistanceKm: number }) => void;
  addCheer: (glyph: string) => void;
  togglePause: () => void;
  resetActiveRun: () => void;

  receipts: Receipt[];
  addReceipt: (r: Receipt) => void;

  lastReceiptPreviewId: string | null;
  setLastReceiptPreviewId: (id: string | null) => void;
}

const initialUser: MockUser = {
  id: 'u-you',
  displayName: 'Miguel Reyes',
  level: 12,
  totalRuns: 48,
  streak: 6,
  paceProfile: "PACE ID · MODERATE 05'50\"",
};

function initialParticipants(): Participant[] {
  return [];
}

export const useRunTableStore = create<RunTableState>()(
  persist(
    (set, get) => ({
      authUser: initialUser,
      setAuthUser: (partial) =>
        set((s) => ({
          authUser: { ...s.authUser, ...partial },
        })),

      draftRun: null,
      setDraftRun: (draft) => set({ draftRun: draft }),

      currentRunId: null,
      currentRouteName: '',
      currentDistanceKm: 5,
      currentPolylineId: 'bgc_loop',
      lobbyHostId: initialUser.id,
      maxParticipants: 5,
      participants: initialParticipants(),
      setLobbyFromListing: (listing, host) =>
        set({
          currentRunId: listing.id,
          currentRouteName: listing.routeName,
          currentDistanceKm: listing.distanceKm,
          currentPolylineId: listing.polylineId,
          lobbyHostId: host.id,
          maxParticipants: Math.min(listing.capacity, 20),
          participants: [host],
        }),
      seedNewRun: ({ runId, routeName, distanceKm, maxParticipants, host, polylineId }) =>
        set({
          currentRunId: runId,
          currentRouteName: routeName,
          currentDistanceKm: distanceKm,
          currentPolylineId: polylineId ?? 'bgc_loop',
          lobbyHostId: host.id,
          maxParticipants,
          participants: [host],
        }),
      resetLobby: () =>
        set({
          currentRunId: null,
          currentRouteName: '',
          currentPolylineId: 'bgc_loop',
          participants: [],
        }),
      addParticipant: (p) =>
        set((s) => {
          if (s.participants.some((x) => x.id === p.id)) return s;
          if (s.participants.length >= s.maxParticipants) return s;
          return { participants: [...s.participants, p] };
        }),
      toggleReady: (id) =>
        set((s) => ({
          participants: s.participants.map((x) =>
            x.id === id ? { ...x, isReady: !x.isReady } : x
          ),
        })),

      elapsedMs: 0,
      paused: false,
      currentPaceLabel: '—',
      leaderboard: [],
      packPositions: {},
      cheerEvents: [],
      startActiveRun: ({ paceLabel, participants, distanceKm }) => {
        const lb = buildInitialLeaderboard(participants);
        const first = nextProgressTick({ participants, tickIndex: 0, targetDistanceKm: distanceKm });
        set({
          elapsedMs: 0,
          paused: false,
          currentPaceLabel: paceLabel,
          leaderboard: first.leaderboard.length ? first.leaderboard : lb,
          packPositions: first.positions,
          cheerEvents: [],
          currentDistanceKm: distanceKm,
        });
      },
      tickLiveRun: ({ tickIndex, targetDistanceKm }) => {
        const { participants } = get();
        if (!participants.length) return;
        const { positions, leaderboard } = nextProgressTick({
          participants,
          tickIndex,
          targetDistanceKm,
        });
        set((s) => ({
          packPositions: positions,
          leaderboard,
          elapsedMs: s.elapsedMs + 600,
        }));
      },
      addCheer: (glyph) => {
        const id = `cheer-${Date.now()}`;
        set((s) => ({
          cheerEvents: [...s.cheerEvents.slice(-12), { id, glyph, createdAt: Date.now() }],
        }));
      },
      togglePause: () => set((s) => ({ paused: !s.paused })),
      resetActiveRun: () =>
        set({
          elapsedMs: 0,
          paused: false,
          leaderboard: [],
          packPositions: {},
          cheerEvents: [],
        }),

      receipts: [],
      addReceipt: (r) => set((s) => ({ receipts: [r, ...s.receipts] })),

      lastReceiptPreviewId: null,
      setLastReceiptPreviewId: (id) => set({ lastReceiptPreviewId: id }),
    }),
    {
      name: 'runtable-persist',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (s) => ({
        authUser: s.authUser,
        receipts: s.receipts,
        lastReceiptPreviewId: s.lastReceiptPreviewId,
      }),
    }
  )
);

export type RunTableStore = ReturnType<typeof useRunTableStore.getState>;
