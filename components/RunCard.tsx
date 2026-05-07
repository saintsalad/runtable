import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { PaceBadge } from '@/components/PaceBadge';
import { RoutePreview } from '@/components/RoutePreview';
import type { RunListing } from '@/types';

type RunCardProps = {
  run: RunListing;
  onPress?: (run: RunListing) => void;
  layout?: 'carousel' | 'feed';
};

export const RunCard = memo(function RunCard({ run, onPress, layout = 'carousel' }: RunCardProps) {
  const widthClass = layout === 'carousel' ? 'mr-4 w-72' : 'w-full';

  return (
    <Pressable
      onPress={() => onPress?.(run)}
      className={`overflow-hidden rounded-3xl border border-white/10 bg-runtable-card active:opacity-90 ${widthClass}`}>
      <View className="h-28 w-full overflow-hidden">
        <RoutePreview polylineId={run.polylineId} variant="thumb" />
      </View>
      <View className="gap-2 p-4">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="flex-1 text-lg font-semibold text-white" numberOfLines={1}>
            {run.routeName}
          </Text>
          <PaceBadge zone={run.paceZone} compact />
        </View>
        <Text className="text-sm text-runtable-muted">
          {run.paceMin} – {run.paceMax} /km · {run.distanceKm} km
        </Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Image
              source={{ uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${run.host.id}` }}
              style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: run.host.avatarColor }}
              contentFit="cover"
            />
            <Text className="text-sm text-white">{run.host.name}</Text>
          </View>
          <Text className="text-sm font-semibold text-runtable-accent">
            {run.filled}/{run.capacity}
          </Text>
        </View>
        <Text className="text-xs text-runtable-muted">{run.startTimeLabel}</Text>
      </View>
    </Pressable>
  );
});
