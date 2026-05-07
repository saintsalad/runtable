import { memo } from 'react';
import { View } from 'react-native';

import { RUNTABLE_COLORS } from '@/constants/runtable';

type DottedDividerProps = {
  className?: string;
};

/** Thermal tear / rule line — dotted monochrome. */
export const DottedDivider = memo(function DottedDivider({
  className = 'my-3',
}: DottedDividerProps) {
  return (
    <View className={`flex-row items-center gap-1 ${className}`}>
      {Array.from({ length: 42 }).map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 1,
            maxWidth: 4,
            backgroundColor: RUNTABLE_COLORS.border,
            opacity: 0.95,
          }}
        />
      ))}
    </View>
  );
});
