import type { DevMockRole, ParticipantRunStatus, SessionPhase } from '@/types/session';

export function computeEffectiveHost(args: {
  devMockRole: DevMockRole;
  lobbyHostId: string;
  authUserId: string;
}): boolean {
  if (args.devMockRole === 'host') return true;
  if (args.devMockRole === 'joiner') return false;
  return args.lobbyHostId === args.authUserId;
}

/** Inputs for permission checks — host identity + room phase + current runner state. */
export interface SessionPermissionInput {
  isEffectiveHost: boolean;
  sessionPhase: SessionPhase;
  /** Current user's run slice status; omit defaults to READY for lobby. */
  participantRunStatus?: ParticipantRunStatus;
}

export function canCancelWaitingSession(i: SessionPermissionInput): boolean {
  return i.isEffectiveHost && i.sessionPhase === 'WAITING';
}

export function canStartSessionFromLobby(i: SessionPermissionInput): boolean {
  return i.isEffectiveHost && i.sessionPhase === 'WAITING';
}

export function canCloseLiveSession(i: SessionPermissionInput): boolean {
  return i.isEffectiveHost && i.sessionPhase === 'LIVE';
}

/** Host-only: global pause affects the mock session for everyone. */
export function canControlSessionPause(i: SessionPermissionInput): boolean {
  return i.isEffectiveHost && i.sessionPhase === 'LIVE';
}

export function canFinishPersonalRun(i: SessionPermissionInput): boolean {
  if (i.sessionPhase !== 'LIVE') return false;
  const st = i.participantRunStatus ?? 'READY';
  return st !== 'FINISHED' && st !== 'LEFT';
}

export function canLeaveLiveSession(i: SessionPermissionInput): boolean {
  if (i.sessionPhase !== 'LIVE') return false;
  const st = i.participantRunStatus ?? 'READY';
  return st !== 'LEFT';
}

export function canViewLiveStats(i: SessionPermissionInput): boolean {
  return i.sessionPhase === 'LIVE';
}

export function canHostShareRoom(i: SessionPermissionInput): boolean {
  return i.isEffectiveHost && i.sessionPhase === 'LIVE';
}

export function canHostViewParticipantsSheet(i: SessionPermissionInput): boolean {
  return i.isEffectiveHost && i.sessionPhase === 'LIVE';
}
