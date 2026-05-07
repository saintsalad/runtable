import {
  canCancelWaitingSession,
  canCloseLiveSession,
  canControlSessionPause,
  canFinishPersonalRun,
  canHostShareRoom,
  canHostViewParticipantsSheet,
  canLeaveLiveSession,
  canStartSessionFromLobby,
  canViewLiveStats,
} from '@/lib/sessionPermissions';
import { useRunTableStore } from '@/store';
import { useEffectiveHost } from '@/hooks/useEffectiveHost';

export function useSessionPermissions() {
  const isEffectiveHost = useEffectiveHost();
  const sessionPhase = useRunTableStore((s) => s.sessionPhase);
  const authUserId = useRunTableStore((s) => s.authUser.id);
  const participantRunStatus = useRunTableStore(
    (s) => s.participantRuns[authUserId]?.status
  );

  const input = {
    isEffectiveHost,
    sessionPhase,
    participantRunStatus,
  };

  return {
    isEffectiveHost,
    sessionPhase,
    participantRunStatus,
    canCancelWaitingSession: canCancelWaitingSession(input),
    canStartSessionFromLobby: canStartSessionFromLobby(input),
    canCloseLiveSession: canCloseLiveSession(input),
    canControlSessionPause: canControlSessionPause(input),
    canFinishPersonalRun: canFinishPersonalRun(input),
    canLeaveLiveSession: canLeaveLiveSession(input),
    canViewLiveStats: canViewLiveStats(input),
    canHostShareRoom: canHostShareRoom(input),
    canHostViewParticipants: canHostViewParticipantsSheet(input),
  };
}
