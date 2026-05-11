export type SessionPhase = 'WAITING' | 'LOCKED' | 'COUNTDOWN' | 'LIVE' | 'CLOSED';

/** Per-runner lifecycle inside a room — separate from overall session phase. */
export type ParticipantRunStatus = 'READY' | 'RUNNING' | 'FINISHED' | 'LEFT';

export type DevMockRole = 'auto' | 'host' | 'joiner';

export type RunMood = 'CHILL' | 'TEMPO' | 'RECOVERY' | 'CHAOTIC' | 'LOCKED IN';

/** Ready Room arrival state — set by each participant before the run starts. */
export type ArrivalStatus = 'READY' | 'ON THE WAY' | 'RUNNING LATE';

export type WeatherAtmosphere = 'DRIZZLE' | 'HUMID' | 'CLEAR NIGHT' | 'WINDY';

export type MapTimeAtmosphere = 'night' | 'morning';

export interface ParticipantRunSlice {
  status: ParticipantRunStatus;
  /** Wall-clock session elapsed captured at FINISHED */
  frozenElapsedMs?: number;
  finalPlacement?: number;
}
