import type {
  DevMockRole,
  ParticipantRunSlice,
  ParticipantRunStatus,
  RunMood,
  SessionPhase,
  WeatherAtmosphere,
} from '@/types/session';

export type PaceZone = 'easy' | 'moderate' | 'tempo' | 'fast';

export type {
  DevMockRole,
  ParticipantRunSlice,
  ParticipantRunStatus,
  RunMood,
  SessionPhase,
  WeatherAtmosphere,
} from '@/types/session';

export interface Friend {
  id: string;
  name: string;
  isActive: boolean;
  avatarColor: string;
}

export interface RunHost {
  id: string;
  name: string;
  avatarColor: string;
}

export interface RunListing {
  id: string;
  routeName: string;
  paceMin: string;
  paceMax: string;
  paceZone: PaceZone;
  host: RunHost;
  filled: number;
  capacity: number;
  distanceKm: number;
  startTimeLabel: string;
  polylineId: string;
  coordinate: { latitude: number; longitude: number };
}

export interface Participant {
  id: string;
  name: string;
  avatarColor: string;
  paceZone: PaceZone;
  isHost: boolean;
  isReady: boolean;
  bitmapAvatarUri?: string | null;
  runMood?: RunMood | null;
}

export interface LeaderboardEntry {
  participantId: string;
  name: string;
  avatarColor: string;
  distanceKm: number;
  rank: number;
}

export interface CheerEvent {
  id: string;
  glyph: string;
  createdAt: number;
}

export interface RouteMeta {
  id: string;
  name: string;
  distanceKm: number;
}

export interface MockUser {
  id: string;
  displayName: string;
  level: number;
  totalRuns: number;
  streak: number;
  paceProfile: string;
  thermalAvatarUri?: string | null;
  /** Processed bitmap / thermal portrait (file URI). */
  bitmapAvatarUri?: string | null;
}

export interface ReceiptParticipantLine {
  rank: number;
  displayName: string;
  paceQuote: string;
  portraitUri?: string | null;
}

export interface ReceiptBadge {
  id: string;
  label: string;
}

export interface Receipt {
  id: string;
  routeName: string;
  distanceKm: number;
  durationLabel: string;
  paceSummary: string;
  completedAt: string;
  hostName: string;
  participantIds: string[];
  participantLines?: ReceiptParticipantLine[];
  runnerCountLabel?: string;
  polylineId: string;
  weatherLabel?: string;
  badges: ReceiptBadge[];
  footerQuote?: string;
  stampLabels?: string[];
  runMoodLabel?: string;
  participantPortraitUris?: Record<string, string>;
  isPersonalRunReceipt?: boolean;
  groupCollectiveLine?: string;
  sessionSnapshot?: SessionPhase;
}
