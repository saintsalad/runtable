import { computeEffectiveHost } from '@/lib/sessionPermissions';
import { useDevSessionStore } from '@/store/devSessionStore';
import { useRunTableStore } from '@/store';

/** Dev role override + lobby host identity for UI permission branching. */
export function useEffectiveHost(): boolean {
  const devMockRole = useDevSessionStore((s) => s.devMockRole);
  const lobbyHostId = useRunTableStore((s) => s.lobbyHostId);
  const authUserId = useRunTableStore((s) => s.authUser.id);
  return computeEffectiveHost({ devMockRole, lobbyHostId, authUserId });
}
