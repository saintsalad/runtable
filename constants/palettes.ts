/** Phase 3.5 semantic tokens — use via `useSemanticTheme()` (no stray hex in components). */

export interface SemanticPalette {
  background: string;
  backgroundElevated: string;
  card: string;
  surface: string;
  text: string;
  muted: string;
  faint: string;
  border: string;
  receiptPaper: string;
  thermalInk: string;
  sepia: string;
  shadowSoft: string;
  mapPad: string;
  mapGlow: string;
}

export const darkPalette: SemanticPalette = {
  background: '#111111',
  backgroundElevated: '#161616',
  card: '#202020',
  surface: '#252525',
  text: '#F4F1EA',
  muted: '#D8D3CB',
  faint: '#9A958C',
  border: '#3A3936',
  receiptPaper: '#FAF6EE',
  thermalInk: '#2B2B2B',
  sepia: '#C4B8A8',
  shadowSoft: 'rgba(0,0,0,0.35)',
  mapPad: '#141414',
  mapGlow: 'rgba(244,241,234,0.12)',
};

export const lightPalette: SemanticPalette = {
  background: '#F6F1E7',
  backgroundElevated: '#EFE7DA',
  card: '#FAF6EE',
  surface: '#F3ECDF',
  text: '#2B2B2B',
  muted: '#555555',
  faint: '#6E6E6E',
  border: '#D6CCBC',
  receiptPaper: '#FAF6EE',
  thermalInk: '#2B2B2B',
  sepia: '#B5A892',
  shadowSoft: 'rgba(43,43,43,0.08)',
  mapPad: '#EFE7DA',
  mapGlow: 'rgba(43,43,43,0.06)',
};

export type ThemePreference = 'system' | 'light' | 'dark';
