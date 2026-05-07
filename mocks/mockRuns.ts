import { colorForName, mockFullName, ROUTE_NAMES, randomPaceZone } from '@/mocks/fixtures';
import type { RunHost, RunListing } from '@/types';

const POLY_IDS = ['bgc_loop', 'rizal_strip', 'makati_grid', 'diliman_oval'] as const;

function hostFor(i: number): RunHost {
  const name = mockFullName(300 + i * 17);
  return {
    id: `h-${i}`,
    name,
    avatarColor: colorForName(name),
  };
}

export function generateMockListings(count: number): RunListing[] {
  return Array.from({ length: count }).map((_, i) => {
    const cap = 4 + (i % 4);
    const filled = Math.min(cap, i % cap);
    const zone = randomPaceZone(i + 3);
    const routeName = ROUTE_NAMES[i % ROUTE_NAMES.length]!;
    const host = hostFor(i);
    return {
      id: `run-${i}`,
      routeName,
      paceMin: zone === 'easy' ? '6:30' : zone === 'moderate' ? '5:50' : zone === 'tempo' ? '5:05' : '4:35',
      paceMax: zone === 'easy' ? '7:15' : zone === 'moderate' ? '6:10' : zone === 'tempo' ? '5:25' : '4:55',
      paceZone: zone,
      host,
      filled,
      capacity: cap,
      distanceKm: 4 + (i % 5) * 0.8,
      startTimeLabel: i % 2 === 0 ? `Today · ${6 + (i % 3)}:${10 + i % 4}0 AM` : `Tomorrow · 5:45 PM`,
      polylineId: POLY_IDS[i % POLY_IDS.length]!,
    };
  });
}

export const mockRunListingsQueryKey = {
  key: ['runs', 'upcoming'] as const,
  data: generateMockListings(14),
};
