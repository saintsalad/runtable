import { useMemo } from 'react';

import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';

/** Literal Tailwind classes so the JIT scanner keeps both themes. */
const dark = {
  bg: 'bg-runtable-bg',
  bgElevated: 'bg-runtable-bg-elevated',
  card: 'bg-runtable-card',
  surface: 'bg-runtable-surface',
  text: 'text-runtable-text',
  muted: 'text-runtable-muted',
  faint: 'text-runtable-faint',
  border: 'border-runtable-border',
} as const;

const light = {
  bg: 'bg-runtableLight-bg',
  bgElevated: 'bg-runtableLight-bg-elevated',
  card: 'bg-runtableLight-card',
  surface: 'bg-runtableLight-surface',
  text: 'text-runtableLight-text',
  muted: 'text-runtableLight-muted',
  faint: 'text-runtableLight-faint',
  border: 'border-runtableLight-border',
} as const;

export type ThemedTw = {
  bg: string;
  bgElevated: string;
  card: string;
  surface: string;
  text: string;
  muted: string;
  faint: string;
  border: string;
};

export function useThemedTw(): ThemedTw {
  const { mode } = useThemeTokens();
  return useMemo(() => (mode === 'dark' ? dark : light), [mode]);
}
