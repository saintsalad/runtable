import type { LeaderboardEntry, ReceiptParticipantLine } from '@/types';

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Renders marathon-style pace per km as 05'22". */
export function formatPaceQuote(secPerKm: number): string {
  const clamped = Math.max(240, Math.min(480, Math.round(secPerKm)));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${m.toString().padStart(2, '0')}'${s.toString().padStart(2, '0')}"`;
}

export function buildReceiptParticipantLines(
  leaderboard: LeaderboardEntry[],
  maxRows = 12
): ReceiptParticipantLine[] {
  const sorted = [...leaderboard].sort((a, b) => a.rank - b.rank);
  return sorted.slice(0, maxRows).map((e) => {
    const sec = 294 + e.rank * 11 + (hashId(`${e.participantId}:${e.name}`) % 36);
    return {
      rank: e.rank,
      displayName: e.name.toUpperCase(),
      paceQuote: formatPaceQuote(sec),
    };
  });
}
