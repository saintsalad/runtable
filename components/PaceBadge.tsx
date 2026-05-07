import { Text, View } from 'react-native';

import type { PaceZone } from '@/types';

const LABEL: Record<PaceZone, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  tempo: 'Tempo',
  fast: 'Fast',
};

const BADGE: Record<PaceZone, string> = {
  easy: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
  moderate: 'bg-sky-500/20 text-sky-200 border-sky-400/25',
  tempo: 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-400/25',
  fast: 'bg-orange-500/20 text-orange-200 border-orange-400/25',
};

type PaceBadgeProps = {
  zone: PaceZone;
  compact?: boolean;
};

export function PaceBadge({ zone, compact }: PaceBadgeProps) {
  const styles = BADGE[zone];
  return (
    <View
      className={`rounded-full border px-2.5 py-1 ${styles} ${compact ? 'px-2 py-0.5' : ''}`}>
      <Text className={`font-semibold ${compact ? 'text-[10px]' : 'text-xs'}`}>{LABEL[zone]}</Text>
    </View>
  );
}
