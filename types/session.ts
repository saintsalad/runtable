export type SessionPhase = 'WAITING' | 'COUNTDOWN' | 'LIVE' | 'CLOSED';

/** Per-runner lifecycle inside a room — separate from overall session phase. */
export type ParticipantRunStatus = 'READY' | 'RUNNING' | 'FINISHED' | 'LEFT';

export type DevMockRole = 'auto' | 'host' | 'joiner';

export type RunMood = 'CHILL' | 'TEMPO' | 'RECOVERY' | 'CHAOTIC' | 'LOCKED IN';

export type WeatherAtmosphere = 'DRIZZLE' | 'HUMID' | 'CLEAR NIGHT' | 'WINDY';

export type MapTimeAtmosphere = 'night' | 'morning';

export interface ParticipantRunSlice {
  status: ParticipantRunStatus;
  /** Wall-clock session elapsed captured at FINISHED */
  frozenElapsedMs?: number;
  finalPlacement?: number;
}
