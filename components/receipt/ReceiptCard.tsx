import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { ReceiptRoute } from '@/components/receipt/ReceiptRoute';
import type { Receipt } from '@/types';

type ReceiptCardProps = {
  receipt: Receipt;
  height: number;
  stackIndex?: number;
  onPress?: () => void;
};

const APressable = Animated.createAnimatedComponent(Pressable);

/** Stacked thermal slip preview for profile grid. */
export const ReceiptCard = memo(function ReceiptCard({
  receipt,
  height,
  stackIndex = 0,
  onPress,
}: ReceiptCardProps) {
  const shift = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: stackIndex * -6 + shift.value * -3 },
      { rotate: `${stackIndex % 2 === 0 ? -1.2 : 1.2}deg` },
    ],
  }));

  return (
    <APressable
      onPressIn={() => {
        shift.value = withSpring(1, { damping: 18, stiffness: 240 });
      }}
      onPressOut={() => {
        shift.value = withSpring(0, { damping: 16, stiffness: 200 });
      }}
      onPress={onPress}
      style={[
        style,
        {
          height,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.5,
          shadowRadius: 10,
          elevation: 5,
        },
      ]}
      className="mb-3 overflow-hidden border border-runtable-border bg-runtable-paper">
      <View className="h-16 w-full border-b border-black/10">
        <ReceiptRoute polylineId={receipt.polylineId} height={64} />
      </View>
      <View className="flex-1 justify-between gap-1 p-3">
        <Text className="font-mono-semibold text-[10px] uppercase tracking-[0.25em] text-runtable-ink" numberOfLines={2}>
          {receipt.routeName}
        </Text>
        <View>
          <Text className="font-mono text-[9px] uppercase tracking-widest text-black/40">
            {receipt.completedAt}
          </Text>
          <Text className="mt-1 font-mono text-[11px] text-runtable-ink">
            {receipt.distanceKm.toFixed(2)} KM · {receipt.durationLabel}
          </Text>
        </View>
      </View>
    </APressable>
  );
});
