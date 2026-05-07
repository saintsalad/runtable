import { Text, View } from 'react-native';

import { ThermalCard } from '@/components/ui/ThermalCard';
import { useRuntableLegacyColors } from '@/hooks/useRuntableLegacyColors';
import { useThemedTw } from '@/hooks/useThemedTw';

type CapacityBarProps = {
  filled: number;
  capacity: number;
};

export function CapacityBar({ filled, capacity }: CapacityBarProps) {
  const colors = useRuntableLegacyColors();
  const tw = useThemedTw();
  const pct = capacity <= 0 ? 0 : Math.min(100, Math.round((filled / capacity) * 100));
  const dense = capacity > 12;

  return (
    <ThermalCard className="px-4 py-3">
      <View className="mb-2 flex-row items-center justify-between">
        <Text
          style={{ fontFamily: 'IBMPlexMono_400Regular' }}
          className={`text-[10px] uppercase tracking-[0.25em] ${tw.faint}`}>
          TABLE FILL
        </Text>
        <Text
          style={{ fontFamily: 'IBMPlexMono_600SemiBold' }}
          className={`text-[11px] ${tw.text}`}>
          {filled}/{capacity}
          {dense ? ` · ${capacity} SLOTS` : ''}
        </Text>
      </View>
      <View className={`h-2 overflow-hidden border ${tw.border} ${tw.surface}`}>
        <View className="h-full" style={{ width: `${pct}%`, backgroundColor: colors.text }} />
      </View>
    </ThermalCard>
  );
}
