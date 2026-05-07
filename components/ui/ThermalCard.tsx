import type { PropsWithChildren } from 'react';
import { memo } from 'react';
import { View } from 'react-native';

import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';

type ThermalCardProps = PropsWithChildren<{
  className?: string;
  elevated?: boolean;
}>;

export const ThermalCard = memo(function ThermalCard({
  children,
  className = '',
  elevated,
}: ThermalCardProps) {
  const t = useThemeTokens();
  const bg = elevated ? t.surface : t.card;

  return (
    <View
      className={className}
      style={{
        backgroundColor: bg,
        borderColor: t.border,
        borderWidth: 1,
        borderRadius: 12,
        ...(elevated
          ? {
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: t.mode === 'dark' ? 0.35 : 0.08,
              shadowRadius: 14,
              elevation: 4,
            }
          : {}),
      }}>
      {children}
    </View>
  );
});
