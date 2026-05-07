import type { PropsWithChildren } from 'react';
import { createContext, useContext } from 'react';

import { useSemanticTheme, type SemanticTheme } from '@/hooks/useSemanticTheme';

const ThemeTokensContext = createContext<SemanticTheme | null>(null);

export function ThemeTokensProvider({ children }: PropsWithChildren) {
  const theme = useSemanticTheme();
  return <ThemeTokensContext.Provider value={theme}>{children}</ThemeTokensContext.Provider>;
}

/** Semantic palette + preference; falls back to hook if provider missing. */
export function useThemeTokens(): SemanticTheme {
  const ctx = useContext(ThemeTokensContext);
  const direct = useSemanticTheme();
  return ctx ?? direct;
}
