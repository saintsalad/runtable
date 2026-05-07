import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { RoutePreview } from '@/components/RoutePreview';
import type { Receipt } from '@/types';

type ReceiptCardProps = {
  receipt: Receipt;
  height: number;
  onPress?: () => void;
};

export const ReceiptCard = memo(function ReceiptCard({ receipt, height, onPress }: ReceiptCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-3 overflow-hidden rounded-3xl border border-white/10 active:opacity-90"
      style={{ height }}>
      <LinearGradient
        colors={['#1a2330', '#0f141c']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}>
        <View className="h-24 w-full opacity-90">
          <RoutePreview polylineId={receipt.polylineId} variant="thumb" />
        </View>
        <View className="flex-1 justify-between p-3">
          <Text className="text-sm font-semibold text-white" numberOfLines={2}>
            {receipt.routeName}
          </Text>
          <View>
            <Text className="text-xs text-runtable-muted">{receipt.completedAt}</Text>
            <Text className="text-xs font-semibold text-runtable-accent">
              {receipt.distanceKm} km · {receipt.durationLabel}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
});
