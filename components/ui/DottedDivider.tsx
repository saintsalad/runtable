import { memo } from 'react';
import { View } from 'react-native';

import { useRuntableLegacyColors } from '@/hooks/useRuntableLegacyColors';

type DottedDividerProps = {
  className?: string;
};

/** Thermal tear / rule line — dotted monochrome. */
export const DottedDivider = memo(function DottedDivider({
  className = 'my-3',
}: DottedDividerProps) {
  const colors = useRuntableLegacyColors();
  return (
    <View className={`flex-row items-center gap-1 ${className}`}>
      {Array.from({ length: 42 }).map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 1,
            maxWidth: 4,
            backgroundColor: colors.border,
            opacity: 0.95,
          }}
        />
      ))}
    </View>
  );
});
