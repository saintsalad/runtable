import { PACE_ZONE_ORDER } from '@/constants/runtable';
import type { PaceZone } from '@/types';
import * as Haptics from 'expo-haptics';
import { memo, useMemo } from 'react';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const LABELS: Record<PaceZone, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  tempo: 'Tempo',
  fast: 'Fast',
};

type PaceSegmentedProps = {
  value: PaceZone;
  onChange: (z: PaceZone) => void;
};

export const PaceSegmented = memo(function PaceSegmented({ value, onChange }: PaceSegmentedProps) {
  const index = useMemo(() => Math.max(0, PACE_ZONE_ORDER.indexOf(value)), [value]);
  const slide = useSharedValue(index);
  const rowWidth = useSharedValue(0);

  slide.value = withSpring(index, { damping: 18, stiffness: 220 });

  const onLayout = (e: LayoutChangeEvent) => {
    rowWidth.value = e.nativeEvent.layout.width;
  };

  const pillStyle = useAnimatedStyle(() => {
    const w = rowWidth.value;
    const segment = w > 0 ? w / PACE_ZONE_ORDER.length : 0;
    return {
      width: Math.max(segment - 8, 0),
      transform: [{ translateX: slide.value * segment + 4 }],
    };
  });

  return (
    <View className="rounded-3xl bg-white/5 p-1">
      <View className="relative overflow-hidden rounded-3xl" onLayout={onLayout}>
        <Animated.View
          style={pillStyle}
          className="absolute left-0 top-1 bottom-1 rounded-2xl bg-runtable-accent/25"
        />
        <View className="z-10 flex-row">
          {PACE_ZONE_ORDER.map((z) => {
            const active = z === value;
            return (
              <Pressable
                key={z}
                onPress={() => {
                  void Haptics.selectionAsync();
                  onChange(z);
                }}
                className="flex-1 items-center py-3">
                <Text
                  className={`text-sm font-semibold ${
                    active ? 'text-runtable-accent' : 'text-runtable-muted'
                  }`}>
                  {LABELS[z]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
});
