import type { PaceZone } from '@/types';
import { PACE_ZONE_ORDER } from '@/constants/runtable';

const FILIPINO_FIRST = [
  'Andrea',
  'Bianca',
  'Carlo',
  'Danica',
  'Elias',
  'Francesca',
  'Gabriel',
  'Hannah',
  'Isko',
  'Jasmine',
  'Kiko',
  'Lara',
  'Miguel',
  'Nina',
  'Paolo',
  'Rafael',
  'Sofia',
  'Tala',
  'Vince',
  'Ysabel',
];

const FILIPINO_LAST = [
  'Reyes',
  'Santos',
  'Cruz',
  'Bautista',
  'Garcia',
  'Torres',
  'Ramirez',
  'Dela Cruz',
  'Flores',
  'Navarro',
  'Mendoza',
  'Villanueva',
];

export const AVATAR_SWATCH = [
  '#7CFF6B',
  '#38BDF8',
  '#A78BFA',
  '#F472B6',
  '#FBBF24',
  '#34D399',
  '#FB923C',
  '#2DD4BF',
];

function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) h = (h * 31 + input.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function colorForName(name: string): string {
  const i = hashString(name) % AVATAR_SWATCH.length;
  return AVATAR_SWATCH[i]!;
}

export function mockFullName(seed: number): string {
  const fi = seed % FILIPINO_FIRST.length;
  const li = (seed * 7) % FILIPINO_LAST.length;
  return `${FILIPINO_FIRST[fi]} ${FILIPINO_LAST[li]}`;
}

export const ROUTE_NAMES = [
  'BGC Loop Glow',
  'Rizal Park Sunrise',
  'Makati Grid Tempo',
  'Marikina River East',
  'UP Diliman Oval',
  'Boni Sidewalk Sprint',
  'Ayala Triangle Drift',
  'Pasig Edge Run',
];

export const WEATHER_CHIPS = [
  'Humid · 29°C',
  'Light breeze · 28°C',
  'After-rain freshness · 27°C',
  'Golden hour · 30°C',
];

export function randomPaceZone(seed: number): PaceZone {
  return PACE_ZONE_ORDER[seed % PACE_ZONE_ORDER.length]!;
}

export function paceLabelFor(zone: PaceZone): string {
  switch (zone) {
    case 'easy':
      return '6:30–7:30 /km';
    case 'moderate':
      return '5:45–6:15 /km';
    case 'tempo':
      return '5:00–5:30 /km';
    case 'fast':
      return '4:15–4:45 /km';
    default:
      return '5:30–6:00 /km';
  }
}

export function mockDelay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
