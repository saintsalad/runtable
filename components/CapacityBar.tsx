import { Text, View } from 'react-native';

import { GlassCard } from '@/components/GlassCard';

type CapacityBarProps = {
  filled: number;
  capacity: number;
};

export function CapacityBar({ filled, capacity }: CapacityBarProps) {
  const pct = capacity <= 0 ? 0 : Math.min(100, Math.round((filled / capacity) * 100));
  const dense = capacity > 12;

  return (
    <GlassCard className="px-4 py-3">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-xs font-medium text-runtable-muted">Pack fill</Text>
        <Text className="text-xs font-semibold text-white">
          {filled}/{capacity}
          {dense ? ` · ${capacity} slots` : ''}
        </Text>
      </View>
      <View className="h-3 overflow-hidden rounded-full bg-white/5">
        <View
          className="h-full rounded-full bg-runtable-accent"
          style={{ width: `${pct}%` }}
        />
      </View>
    </GlassCard>
  );
}
