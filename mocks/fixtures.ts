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
  'Rico',
  'Sofia',
  'Tala',
  'Vince',
  'Ysabel',
  'Ana',
  'Mateo',
  'Liza',
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

/** Grayscale ink swatches — no chroma. */
export const AVATAR_SWATCH = ['#454545', '#5C5C5C', '#3D3D3D', '#6E6E6E', '#2F2F2F', '#8B8B8B'] as const;

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
  'QC NIGHT LOOP',
  'BGC EAST STRIP',
  'RIZAL SUNRISE SECTOR',
  'MAKATI GRID SPLIT',
  'MARIKINA RIVER EAST',
  'UP DILIMAN OVAL',
  'BONI SIDEWALK SECTOR',
  'AYALA TRIANGLE DRIFT',
  'PASIG EDGE RUN',
  'ORTIGAS TERMINAL',
];

export const WEATHER_CHIPS = [
  'NIGHT · 27°C',
  'HUMID · 29°C',
  'DRY · 28°C',
  'POST-RAIN · 26°C',
];

export function randomPaceZone(seed: number): PaceZone {
  return PACE_ZONE_ORDER[seed % PACE_ZONE_ORDER.length]!;
}

export function paceLabelFor(zone: PaceZone): string {
  switch (zone) {
    case 'easy':
      return '6:30–7:30 /KM';
    case 'moderate':
      return '5:45–6:15 /KM';
    case 'tempo':
      return '5:00–5:30 /KM';
    case 'fast':
      return '4:15–4:45 /KM';
    default:
      return '5:30–6:00 /KM';
  }
}

export function mockDelay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
