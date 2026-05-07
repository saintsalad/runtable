import type { LeaderboardEntry, Participant, ParticipantRunSlice } from '@/types';

export interface ProgressTick {
  positions: Record<string, number>;
  leaderboard: LeaderboardEntry[];
}

function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed;
  for (let i = out.length - 1; i > 0; i -= 1) {
    s = (s * 9301 + 49297) % 233280;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export function buildInitialLeaderboard(participants: Participant[]): ProgressTick['leaderboard'] {
  const base = participants.map((p, idx) => ({
    participantId: p.id,
    name: p.name,
    avatarColor: p.avatarColor,
    distanceKm: 0.2 + (idx % 4) * 0.05,
    rank: idx + 1,
  }));
  return base.sort((a, b) => b.distanceKm - a.distanceKm).map((e, i) => ({ ...e, rank: i + 1 }));
}

function statusOf(
  id: string,
  participantRuns?: Record<string, ParticipantRunSlice | undefined>
): string | undefined {
  return participantRuns?.[id]?.status;
}

export function nextProgressTick(args: {
  participants: Participant[];
  tickIndex: number;
  targetDistanceKm: number;
  participantRuns?: Record<string, ParticipantRunSlice | undefined>;
  previousPositions?: Record<string, number>;
}): ProgressTick {
  const { participants, tickIndex, targetDistanceKm, participantRuns, previousPositions } = args;
  const positions: Record<string, number> = {};

  participants.forEach((p, i) => {
    const st = statusOf(p.id, participantRuns);
    if (st === 'FINISHED') {
      positions[p.id] = previousPositions?.[p.id] ?? 0;
      return;
    }
    if (st === 'LEFT') {
      positions[p.id] = previousPositions?.[p.id] ?? 0;
      return;
    }
    const phase = (tickIndex * 0.08 + i * 0.17) % 1;
    const wave = Math.sin(phase * Math.PI * 2) * 0.02;
    const base = Math.min(
      1,
      0.08 + tickIndex * 0.035 + wave + (i % 3) * 0.01 + (hashId(p.id) % 7) * 0.005
    );
    positions[p.id] = base;
  });

  const distances = participants.map((p, i) => {
    const st = statusOf(p.id, participantRuns);
    let dist: number;
    if (st === 'LEFT') {
      dist = 0;
    } else if (st === 'FINISHED') {
      const jitter = (((tickIndex + i * 3) % 5) - 2) * 0.008;
      dist = Math.max(0, targetDistanceKm * (positions[p.id] ?? 0) + jitter);
    } else {
      const jitter = (((tickIndex + i * 3) % 5) - 2) * 0.01;
      dist = Math.max(0, targetDistanceKm * (positions[p.id] ?? 0) + jitter);
    }
    return { p, dist };
  });

  const sorted = shuffleWithSeed(
    [...distances].sort((a, b) => b.dist - a.dist),
    tickIndex
  ).sort((a, b) => b.dist - a.dist);

  const leaderboard: ProgressTick['leaderboard'] = sorted.map((row, idx) => ({
    participantId: row.p.id,
    name: row.p.name,
    avatarColor: row.p.avatarColor,
    distanceKm: Math.round(row.dist * 100) / 100,
    rank: idx + 1,
  }));

  return { positions, leaderboard };
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}
