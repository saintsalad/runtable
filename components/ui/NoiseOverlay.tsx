import { memo, useMemo } from 'react';
import { StyleSheet, View, type DimensionValue, type ViewStyle } from 'react-native';

import { useRuntableLegacyColors } from '@/hooks/useRuntableLegacyColors';

/** Lightweight grain: deterministic micro-dots, no animated loops. */
export const NoiseOverlay = memo(function NoiseOverlay({ opacity = 0.035 }: { opacity?: number }) {
  const colors = useRuntableLegacyColors();
  const dots = useMemo(() => {
    type Dot = { lx: string; ly: string; w: number; h: number };
    const out: Dot[] = [];
    for (let i = 0; i < 56; i += 1) {
      const lxPct = ((((i * 7919 + 499) % 9973) / 9973) * 100).toFixed(2);
      const lyPct = ((((i * 6823 + 2311) % 8777) / 8777) * 100).toFixed(2);
      const w = (((i * 311) % 12) / 80 + 1) * 14;
      const h = (((i * 177) % 10) / 70 + 0.75) * 10;
      out.push({ lx: `${lxPct}%`, ly: `${lyPct}%`, w, h });
    }
    return out;
  }, []);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} collapsable={false}>
      {dots.map((d, idx) => {
        const style: ViewStyle = {
          position: 'absolute',
          left: d.lx as DimensionValue,
          top: d.ly as DimensionValue,
          width: d.w,
          height: d.h,
          backgroundColor: colors.text,
          opacity,
          borderRadius: 1,
        };
        return <View key={`n-${idx}`} style={style} />;
      })}
    </View>
  );
});
