import { useQuery } from '@tanstack/react-query';

import { FREE_TIER_MAX_PARTICIPANTS } from '@/constants/runtable';
import { colorForName, mockDelay, mockFullName, paceLabelFor } from '@/mocks/fixtures';
import { mockRunListingsQueryKey } from '@/mocks/mockRuns';
import type { PaceZone } from '@/types';

export function useUpcomingRuns() {
  return useQuery({
    queryKey: ['runs', 'upcoming'],
    queryFn: async () => {
      await mockDelay(420);
      return mockRunListingsQueryKey.data;
    },
  });
}

export function useRunsFeed() {
  return useQuery({
    queryKey: ['runs', 'mine'],
    queryFn: async () => {
      await mockDelay(300);
      return mockRunListingsQueryKey.data.slice(0, 8);
    },
  });
}

export function useFriendsOnline() {
  return useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      await mockDelay(280);
      return Array.from({ length: 6 }).map((_, i) => {
        const name = mockFullName(200 + i * 13);
        return {
          id: `f-${i}`,
          name,
          isActive: i % 3 !== 0,
          avatarColor: colorForName(name),
        };
      });
    },
  });
}

/** Re-export query data shape for home */
export { mockRunListingsQueryKey };

export function paceZoneLabel(zone: PaceZone): string {
  return paceLabelFor(zone);
}

export { FREE_TIER_MAX_PARTICIPANTS };
