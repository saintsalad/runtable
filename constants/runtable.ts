import { darkPalette, lightPalette } from '@/constants/palettes';

export type RuntableColorScheme = 'light' | 'dark';

/** Legacy flat shape for stroke/fill migration — derived from semantic palettes. */
export type RuntableLegacyColors = {
  bg: string;
  card: string;
  surface: string;
  text: string;
  muted: string;
  faint: string;
  border: string;
  paper: string;
  ink: string;
  focus: string;
};

export function runtableColorsForMode(mode: RuntableColorScheme): RuntableLegacyColors {
  const p = mode === 'dark' ? darkPalette : lightPalette;
  return {
    bg: p.background,
    card: p.card,
    surface: p.surface,
    text: p.text,
    muted: p.muted,
    faint: p.faint,
    border: p.border,
    paper: p.receiptPaper,
    ink: p.thermalInk,
    focus: p.text,
  };
}

/** Default export for static imports; prefer `useRuntableLegacyColors()` in components. */
export const RUNTABLE_COLORS = runtableColorsForMode('dark');

export const FREE_TIER_MAX_PARTICIPANTS = 5;

export const PRO_TIER_MAX_PARTICIPANTS = 24;

export const PACE_ZONE_ORDER = ['easy', 'moderate', 'tempo', 'fast'] as const;
