import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { RUNTABLE_COLORS } from '@/constants/runtable';

/** CRT-style horizontal rulings — static, very low opacity. */
export const ScanlineOverlay = memo(function ScanlineOverlay({ step = 3 }: { step?: number }) {
  const lines = Array.from({ length: Math.ceil(900 / step) }, (_, i) => i * step);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {lines.map((top) => (
        <View
          key={`s-${top}`}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top,
            height: 1,
            backgroundColor: RUNTABLE_COLORS.text,
            opacity: 0.018,
          }}
        />
      ))}
    </View>
  );
});
