import { memo, useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { ParticipantAvatar } from '@/components/ParticipantAvatar';
import type { LeaderboardEntry } from '@/types';

type LeaderboardItemProps = {
  entry: LeaderboardEntry;
  prevRank?: number;
};

export const LeaderboardItem = memo(function LeaderboardItem({ entry, prevRank }: LeaderboardItemProps) {
  const shift = useSharedValue(0);

  useEffect(() => {
    if (prevRank == null) return;
    const delta = prevRank - entry.rank;
    if (delta === 0) return;
    shift.value = withSpring(delta * 6, { damping: 14, stiffness: 180 });
  }, [entry.rank, prevRank, shift]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: shift.value }],
  }));

  return (
    <Animated.View
      style={anim}
      className="mb-3 flex-row items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-3 py-2">
      <View className="flex-row items-center gap-3">
        <Text className="w-6 text-center text-sm font-bold text-runtable-muted">{entry.rank}</Text>
        <ParticipantAvatar name={entry.name} color={entry.avatarColor} size="sm" />
        <Text className="text-sm font-semibold text-white">{entry.name}</Text>
      </View>
      <Text className="text-sm font-semibold text-runtable-accent">{entry.distanceKm} km</Text>
    </Animated.View>
  );
});
