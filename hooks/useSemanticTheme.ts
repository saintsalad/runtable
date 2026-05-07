import { useColorScheme } from 'react-native';

import type { SemanticPalette } from '@/constants/palettes';
import { darkPalette, lightPalette, type ThemePreference } from '@/constants/palettes';
import { useThemeStore } from '@/store/themeStore';

export type ResolvedScheme = 'light' | 'dark';

export interface SemanticTheme extends SemanticPalette {
  mode: ResolvedScheme;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
}

export function useSemanticTheme(): SemanticTheme {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const system = useColorScheme() ?? 'dark';
  const resolved: ResolvedScheme =
    preference === 'system' ? (system === 'light' ? 'light' : 'dark') : preference === 'light' ? 'light' : 'dark';

  const base = resolved === 'light' ? lightPalette : darkPalette;

  return {
    ...base,
    mode: resolved,
    preference,
    setPreference,
  };
}
