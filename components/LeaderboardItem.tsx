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
      className="mb-3 flex-row items-center justify-between border border-runtable-border bg-runtable-card px-3 py-2">
      <View className="flex-row items-center gap-3">
        <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="w-8 text-[12px] text-runtable-muted">
          {entry.rank.toString().padStart(2, '0')}
        </Text>
        <ParticipantAvatar name={entry.name} color={entry.avatarColor} size="sm" />
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[12px] uppercase tracking-wide text-runtable-muted">
          {entry.name}
        </Text>
      </View>
      <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[12px] text-runtable-text">
        {entry.distanceKm.toFixed(2)} KM
      </Text>
    </Animated.View>
  );
});
