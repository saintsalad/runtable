import { useMemo } from 'react';

import { runtableColorsForMode, type RuntableLegacyColors } from '@/constants/runtable';
import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';

export function useRuntableLegacyColors(): RuntableLegacyColors {
  const { mode } = useThemeTokens();
  return useMemo(() => runtableColorsForMode(mode), [mode]);
}
