import type { PropsWithChildren } from 'react';
import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';
import { NoiseOverlay } from '@/components/ui/NoiseOverlay';

type ReceiptPaperProps = PropsWithChildren<{
  perforationDots?: number;
}>;

/** Thermal slip body + micro-perforations on the vertical edges. */
export const ReceiptPaper = memo(function ReceiptPaper({
  children,
  perforationDots = 28,
}: ReceiptPaperProps) {
  const t = useThemeTokens();
  const pegs = Math.max(perforationDots, 8);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        paper: {
          backgroundColor: t.receiptPaper,
          borderWidth: 1,
          borderColor: t.mode === 'dark' ? 'rgba(0,0,0,0.35)' : t.border,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: t.mode === 'dark' ? 0.35 : 0.12,
          shadowRadius: 18,
          elevation: 6,
        },
        dot: {
          width: 3,
          height: 5,
          borderRadius: 1,
          backgroundColor: t.faint,
          opacity: 0.85,
          alignSelf: 'center',
        },
      }),
    [t.border, t.faint, t.mode, t.receiptPaper]
  );

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

      <View style={styles.paper} className="relative overflow-hidden rounded-lg px-6 py-6">
        <NoiseOverlay opacity={0.04} />
        <View className="z-10">{children}</View>
      </View>
    </View>
  );
});
