export type PaceZone = 'easy' | 'moderate' | 'tempo' | 'fast';

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
}

export interface Participant {
  id: string;
  name: string;
  avatarColor: string;
  paceZone: PaceZone;
  isHost: boolean;
  isReady: boolean;
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
  emoji: string;
  createdAt: number;
}

export interface RouteMeta {
  id: string;
  name: string;
  distanceKm: number;
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
  polylineId: string;
  weatherLabel: string;
  badges: ReceiptBadge[];
}

export interface MockUser {
  id: string;
  displayName: string;
  level: number;
  totalRuns: number;
  streak: number;
  paceProfile: string;
}
