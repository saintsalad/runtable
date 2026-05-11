import { colorForName, mockFullName, ROUTE_NAMES, randomPaceZone } from '@/mocks/fixtures';
import type { RunHost, RunListing } from '@/types';

const POLY_IDS = ['bgc_loop', 'rizal_strip', 'makati_grid', 'diliman_oval'] as const;

// Real running spots in Metro Manila / NCR — pinned coordinates for mock listings
const PH_RUNNING_SPOTS = [
  { latitude: 14.6507, longitude: 121.0494 }, // Quezon Memorial Circle
  { latitude: 14.6548, longitude: 121.0649 }, // UP Diliman Academic Oval
  { latitude: 14.5580, longitude: 121.0245 }, // Ayala Triangle Gardens
  { latitude: 14.5547, longitude: 121.0481 }, // Bonifacio Global City Track 30th
  { latitude: 14.6351, longitude: 121.1028 }, // Marikina River Park
  { latitude: 14.5826, longitude: 120.9790 }, // Rizal Park
  { latitude: 14.5540, longitude: 120.9838 }, // CCP Complex Baywalk
  { latitude: 14.5735, longitude: 121.0860 }, // Arcovia City
  { latitude: 14.4185, longitude: 121.0387 }, // Filinvest City
  { latitude: 14.3712, longitude: 120.9365 }, // Vermosa Sports Hub
] as const;

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
      coordinate: PH_RUNNING_SPOTS[i % PH_RUNNING_SPOTS.length]!,
    };
  });
}

export const mockRunListingsQueryKey = {
  key: ['runs', 'upcoming'] as const,
  data: generateMockListings(14),
};
