import type { PropsWithChildren } from 'react';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { NoiseOverlay } from '@/components/ui/NoiseOverlay';
import { RUNTABLE_COLORS } from '@/constants/runtable';

type ReceiptPaperProps = PropsWithChildren<{
  perforationDots?: number;
}>;

/** Thermal slip body + micro-perforations on the vertical edges. */
export const ReceiptPaper = memo(function ReceiptPaper({
  children,
  perforationDots = 28,
}: ReceiptPaperProps) {
  const pegs = Math.max(perforationDots, 8);

  return (
    <View className="relative overflow-visible">
      <View className="absolute -left-[6px] top-3 bottom-3 w-[6px] flex-col justify-between">
        {Array.from({ length: pegs }).map((_, i) => (
          <View key={`l-${i}`} style={styles.dot} />
        ))}
      </View>
      <View className="absolute -right-[6px] top-3 bottom-3 w-[6px] flex-col justify-between">
        {Array.from({ length: pegs }).map((_, i) => (
          <View key={`r-${i}`} style={styles.dot} />
        ))}
      </View>

      <View
        style={styles.paper}
        className="relative overflow-hidden border border-black/40 px-6 py-6">
        <NoiseOverlay opacity={0.04} />
        <View className="z-10">{children}</View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  paper: {
    backgroundColor: RUNTABLE_COLORS.paper,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 6,
  },
  dot: {
    width: 3,
    height: 5,
    borderRadius: 1,
    backgroundColor: RUNTABLE_COLORS.faint,
    opacity: 0.85,
    alignSelf: 'center',
  },
});
