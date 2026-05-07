import { Text, View } from 'react-native';

import type { PaceZone } from '@/types';

const LABEL: Record<PaceZone, string> = {
  easy: 'EASY',
  moderate: 'MOD',
  tempo: 'TMP',
  fast: 'FAST',
};

type PaceBadgeProps = {
  zone: PaceZone;
  compact?: boolean;
};

/** Monochrome chip — grayscale only. */
export function PaceBadge({ zone, compact }: PaceBadgeProps) {
  const pad = compact ? 'px-2 py-0.5' : 'px-2.5 py-1';
  return (
    <View className={`border border-runtable-border bg-runtable-surface ${pad}`}>
      <Text
        className={`font-mono-semibold uppercase text-runtable-muted ${compact ? 'text-[9px]' : 'text-[10px] tracking-[0.2em]'}`}>
        {LABEL[zone]}
      </Text>
    </View>
  );
}
