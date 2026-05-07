import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { buildReceiptParticipantLines } from '@/lib/receiptFormat';
import { buildInitialLeaderboard, nextProgressTick } from '@/mocks/fakeProgress';
import { mmkvStorage } from '@/store/storage';
import type {
  CheerEvent,
  LeaderboardEntry,
  MockUser,
  Participant,
  Receipt,
  RunListing,
  RunMood,
  SessionPhase,
  WeatherAtmosphere,
  ParticipantRunSlice,
} from '@/types';

export type DraftRun = {
  routeName: string;
  distanceKm: number;
  paceZone: import('@/types').PaceZone;
  maxParticipants: number;
  startLabel: string;
  isPublic: boolean;
};

function formatHms(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function bootstrapRuns(parts: Participant[]): Record<string, ParticipantRunSlice> {
  const pr: Record<string, ParticipantRunSlice> = {};
  parts.forEach((p) => {
    pr[p.id] = { status: 'READY' };
  });
  return pr;
}

export interface RunTableState {
  authUser: MockUser;
  setAuthUser: (partial: Partial<MockUser>) => void;

  draftRun: DraftRun | null;
  setDraftRun: (draft: DraftRun | null) => void;

  sessionPhase: SessionPhase;
  setSessionPhase: (p: SessionPhase) => void;
  roomAcceptingJoins: boolean;
  participantRuns: Record<string, ParticipantRunSlice>;
  frozenPackPositions: Record<string, number>;
  ambientWeather: WeatherAtmosphere;
  setAmbientWeather: (w: WeatherAtmosphere) => void;

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
  setParticipantMood: (id: string, mood: RunMood) => void;

  elapsedMs: number;
  paused: boolean;
  currentPaceLabel: string;
  leaderboard: LeaderboardEntry[];
  packPositions: Record<string, number>;
  cheerEvents: CheerEvent[];

  finishPersonalRun: () => Receipt | null;
  leaveSessionSelf: () => void;
  hostCloseSession: () => Receipt | null;
  hostCancelWaitingSession: () => void;

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
  thermalAvatarUri: null,
  bitmapAvatarUri: null,
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

      sessionPhase: 'WAITING',
      setSessionPhase: (p) => set({ sessionPhase: p }),
      roomAcceptingJoins: true,
      participantRuns: {},
      frozenPackPositions: {},
      ambientWeather: 'HUMID',
      setAmbientWeather: (w) => set({ ambientWeather: w }),

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
          sessionPhase: 'WAITING',
          roomAcceptingJoins: true,
          participantRuns: bootstrapRuns([host]),
          frozenPackPositions: {},
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
          sessionPhase: 'WAITING',
          roomAcceptingJoins: true,
          participantRuns: bootstrapRuns([host]),
          frozenPackPositions: {},
        }),
      resetLobby: () =>
        set({
          currentRunId: null,
          currentRouteName: '',
          currentPolylineId: 'bgc_loop',
          participants: [],
          sessionPhase: 'WAITING',
          roomAcceptingJoins: true,
          participantRuns: {},
          frozenPackPositions: {},
        }),
      addParticipant: (p) =>
        set((s) => {
          if (!s.roomAcceptingJoins || s.sessionPhase === 'CLOSED') return s;
          if (s.participants.some((x) => x.id === p.id)) return s;
          if (s.participants.length >= s.maxParticipants) return s;
          return {
            participants: [...s.participants, p],
            participantRuns: { ...s.participantRuns, [p.id]: { status: 'READY' } },
          };
        }),
      toggleReady: (id) =>
        set((s) => ({
          participants: s.participants.map((x) =>
            x.id === id ? { ...x, isReady: !x.isReady } : x
          ),
        })),
      setParticipantMood: (id, mood) =>
        set((s) => ({
          participants: s.participants.map((x) => (x.id === id ? { ...x, runMood: mood } : x)),
        })),

      elapsedMs: 0,
      paused: false,
      currentPaceLabel: '—',
      leaderboard: [],
      packPositions: {},
      cheerEvents: [],
      startActiveRun: ({ paceLabel, participants, distanceKm }) => {
        const lb = buildInitialLeaderboard(participants);
        const runs: Record<string, ParticipantRunSlice> = {};
        participants.forEach((p) => {
          const prev = get().participantRuns[p.id]?.status;
          runs[p.id] = { status: prev === 'LEFT' ? 'LEFT' : 'RUNNING' };
        });
        const first = nextProgressTick({
          participants,
          tickIndex: 0,
          targetDistanceKm: distanceKm,
          participantRuns: runs,
          previousPositions: {},
        });
        set({
          elapsedMs: 0,
          paused: false,
          currentPaceLabel: paceLabel,
          leaderboard: first.leaderboard.length ? first.leaderboard : lb,
          packPositions: first.positions,
          cheerEvents: [],
          currentDistanceKm: distanceKm,
          sessionPhase: 'LIVE',
          roomAcceptingJoins: true,
          participantRuns: runs,
          frozenPackPositions: {},
        });
      },
      tickLiveRun: ({ tickIndex, targetDistanceKm }) => {
        const state = get();
        if (state.sessionPhase !== 'LIVE' || state.paused) return;
        const { participants, participantRuns, packPositions } = state;
        if (!participants.length) return;
        const { positions, leaderboard } = nextProgressTick({
          participants,
          tickIndex,
          targetDistanceKm,
          participantRuns,
          previousPositions: packPositions,
        });
        set((s) => ({
          packPositions: positions,
          leaderboard,
          elapsedMs: s.elapsedMs + 600,
        }));
      },

      finishPersonalRun: () => {
        const s = get();
        const uid = s.authUser.id;
        if (s.sessionPhase !== 'LIVE') return null;
        if (s.participantRuns[uid]?.status === 'FINISHED') return null;

        const rank = s.leaderboard.find((e) => e.participantId === uid)?.rank ?? 1;
        const pos = s.packPositions[uid] ?? 0;
        const distKm = Math.max(s.currentDistanceKm * pos, s.currentDistanceKm * 0.12);
        const mood = s.participants.find((p) => p.id === uid)?.runMood;

        const receipt: Receipt = {
          id: `rc-p-${Date.now()}`,
          routeName: (s.currentRouteName || 'RUN SESSION').toUpperCase(),
          distanceKm: Math.round(distKm * 100) / 100,
          durationLabel: formatHms(Math.max(s.elapsedMs, 1000)),
          paceSummary: s.currentPaceLabel,
          completedAt: new Date().toISOString(),
          hostName: s.participants.find((p) => p.isHost)?.name ?? 'HOST',
          participantIds: [uid],
          participantLines: [
            {
              rank,
              displayName: s.authUser.displayName.toUpperCase(),
              paceQuote: s.currentPaceLabel,
              portraitUri: s.authUser.bitmapAvatarUri ?? s.authUser.thermalAvatarUri ?? null,
            },
          ],
          runnerCountLabel: 'PERSONAL SLIP',
          polylineId: s.currentPolylineId,
          weatherLabel: s.ambientWeather,
          badges: [
            { id: 'b1', label: 'PACK FINISH' },
            { id: 'b2', label: `POS ${rank}` },
          ],
          footerQuote: 'SEE YOU NEXT RUN',
          stampLabels: ['RUN SAVED'],
          runMoodLabel: mood ?? undefined,
          participantPortraitUris: (() => {
            const uri = s.authUser.bitmapAvatarUri ?? s.authUser.thermalAvatarUri;
            return uri ? { [uid]: uri } : undefined;
          })(),
          isPersonalRunReceipt: true,
          sessionSnapshot: 'LIVE',
        };

        set((prev) => ({
          participantRuns: {
            ...prev.participantRuns,
            [uid]: {
              status: 'FINISHED',
              frozenElapsedMs: prev.elapsedMs,
              finalPlacement: rank,
            },
          },
          frozenPackPositions: { ...prev.frozenPackPositions, [uid]: pos },
          receipts: [receipt, ...prev.receipts],
          lastReceiptPreviewId: receipt.id,
        }));

        return receipt;
      },

      leaveSessionSelf: () => {
        const uid = get().authUser.id;
        set((s) => ({
          participantRuns: { ...s.participantRuns, [uid]: { status: 'LEFT' } },
        }));
      },

      hostCloseSession: () => {
        const s = get();
        if (s.sessionPhase !== 'LIVE') return null;

        const coreLines = buildReceiptParticipantLines(s.leaderboard.length ? s.leaderboard : []);
        const lined =
          coreLines.length > 0
            ? coreLines.map((row) => {
                const match = s.participants.find(
                  (p) => p.name.toUpperCase().trim() === row.displayName.trim()
                );
                return { ...row, portraitUri: match?.bitmapAvatarUri ?? null };
              })
            : s.participants.map((p, idx) => ({
                rank: idx + 1,
                displayName: p.name.toUpperCase(),
                paceQuote: "06'05\"",
                portraitUri: p.bitmapAvatarUri ?? null,
              }));

        const n = s.participants.length;
        const footer = `"${n} RUNNERS SHARED THIS NIGHT"`;
        const portraitMap: Record<string, string> = {};
        s.participants.forEach((p) => {
          if (p.bitmapAvatarUri) portraitMap[p.id] = p.bitmapAvatarUri;
        });

        const receipt: Receipt = {
          id: `rc-g-${Date.now()}`,
          routeName: (s.currentRouteName || 'RUNTABLE SESSION').toUpperCase(),
          distanceKm: s.currentDistanceKm,
          durationLabel: formatHms(Math.max(s.elapsedMs, 1000)),
          paceSummary: 'SESSION ARCHIVE · GROUP',
          completedAt: new Date().toISOString(),
          hostName: s.participants.find((p) => p.isHost)?.name ?? s.authUser.displayName,
          participantIds: s.participants.map((p) => p.id),
          participantLines: lined,
          runnerCountLabel: `${n} PARTICIPANTS`,
          polylineId: s.currentPolylineId,
          weatherLabel: s.ambientWeather,
          badges: [
            { id: 's1', label: 'SESSION ARCHIVED' },
            { id: 's2', label: 'FINAL ORDER' },
          ],
          stampLabels: ['ROOM CLOSED'],
          footerQuote: footer,
          groupCollectiveLine: `MOCK GROUP DIST · ${(s.currentDistanceKm * Math.max(n, 1)).toFixed(1)} KM`,
          participantPortraitUris: Object.keys(portraitMap).length ? portraitMap : undefined,
          sessionSnapshot: 'CLOSED',
        };

        set((prev) => ({
          sessionPhase: 'CLOSED',
          roomAcceptingJoins: false,
          receipts: [receipt, ...prev.receipts],
          lastReceiptPreviewId: receipt.id,
        }));

        return receipt;
      },

      hostCancelWaitingSession: () =>
        set({
          currentRunId: null,
          currentRouteName: '',
          currentPolylineId: 'bgc_loop',
          participants: [],
          sessionPhase: 'WAITING',
          roomAcceptingJoins: true,
          participantRuns: {},
          frozenPackPositions: {},
          elapsedMs: 0,
          paused: false,
          leaderboard: [],
          packPositions: {},
          cheerEvents: [],
          draftRun: null,
        }),
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
          participantRuns: {},
          frozenPackPositions: {},
          sessionPhase: 'WAITING',
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
