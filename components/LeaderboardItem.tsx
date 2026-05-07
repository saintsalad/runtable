import { memo, useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { ParticipantAvatar } from '@/components/ParticipantAvatar';
import { RunStatusChip, runStatusLabel } from '@/components/run/RunStatusChip';
import { useThemedTw } from '@/hooks/useThemedTw';
import type { LeaderboardEntry, ParticipantRunStatus } from '@/types';

type LeaderboardItemProps = {
  entry: LeaderboardEntry;
  prevRank?: number;
  runStatus?: ParticipantRunStatus;
};

export const LeaderboardItem = memo(function LeaderboardItem({ entry, prevRank, runStatus }: LeaderboardItemProps) {
  const shift = useSharedValue(0);
  const tw = useThemedTw();

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
      className={`mb-3 flex-row items-center justify-between border ${tw.border} ${tw.card} px-3 py-2`}>
      <View className="flex-row items-center gap-3">
        <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className={`w-8 text-[12px] ${tw.muted}`}>
          {entry.rank.toString().padStart(2, '0')}
        </Text>
        <View className="relative">
          <ParticipantAvatar name={entry.name} color={entry.avatarColor} size="sm" />
          {runStatus ? (
            <View className="absolute -right-3 -top-1">
              <RunStatusChip text={runStatusLabel(runStatus)} />
            </View>
          ) : null}
        </View>
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className={`text-[12px] uppercase tracking-wide ${tw.muted}`}>
          {entry.name}
        </Text>
      </View>
      <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className={`text-[12px] ${tw.text}`}>
        {entry.distanceKm.toFixed(2)} KM
      </Text>
    </Animated.View>
  );
});
