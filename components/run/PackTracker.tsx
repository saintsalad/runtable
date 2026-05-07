import { memo, useEffect } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import { ParticipantAvatar } from '@/components/ParticipantAvatar';
import { RunStatusChip, runStatusLabel } from '@/components/run/RunStatusChip';
import { useRuntableLegacyColors } from '@/hooks/useRuntableLegacyColors';
import type { Participant, ParticipantRunSlice, ParticipantRunStatus } from '@/types';

export type PackTrackerProps = {
  participants: Participant[];
  positions: Record<string, number>;
  participantRuns?: Record<string, ParticipantRunSlice | undefined>;
  height?: number;
  onTrackWidth?: (w: number) => void;
};

export const PackTracker = memo(function PackTracker({
  participants,
  positions,
  participantRuns,
  height = 112,
  onTrackWidth,
}: PackTrackerProps) {
  const colors = useRuntableLegacyColors();
  const trackWidth = useSharedValue(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width - 32;
    trackWidth.value = w;
    onTrackWidth?.(w);
  };

  return (
    <View className="w-full" style={{ height }} onLayout={onLayout}>
      <View className="flex-1 justify-center px-4">
        <View
          className="relative h-[10px] overflow-hidden rounded-none border border-runtable-border"
          style={{ backgroundColor: colors.surface }}>
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: '18%',
              top: 2,
              bottom: 2,
              width: 2,
              backgroundColor: colors.faint,
              opacity: 0.65,
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: '46%',
              top: 2,
              bottom: 2,
              width: 2,
              backgroundColor: colors.faint,
              opacity: 0.45,
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              right: '26%',
              top: 2,
              bottom: 2,
              width: 2,
              backgroundColor: colors.faint,
              opacity: 0.45,
            }}
          />
        </View>

        <View className="absolute inset-x-0" style={{ height }}>
          {participants.map((p) => (
            <PackRunnerDot
              key={p.id}
              participant={p}
              progress={positions[p.id] ?? 0}
              trackWidth={trackWidth}
              height={height}
              runStatus={participantRuns?.[p.id]?.status}
            />
          ))}
        </View>
      </View>
    </View>
  );
});

type RunnerDotProps = {
  participant: Participant;
  progress: number;
  trackWidth: SharedValue<number>;
  height: number;
  runStatus?: ParticipantRunStatus;
};

const PackRunnerDot = memo(function PackRunnerDot({
  participant,
  progress,
  trackWidth,
  height,
  runStatus,
}: RunnerDotProps) {
  const progressSv = useSharedValue(progress);

  useEffect(() => {
    progressSv.value = withSpring(progress, { damping: 22, stiffness: 140 });
  }, [progress, progressSv]);

  const style = useAnimatedStyle(() => {
    const w = Math.max(trackWidth.value, 1);
    const x = interpolate(progressSv.value, [0, 1], [10, w - 10]);
    return {
      transform: [{ translateX: x }, { translateY: height / 2 - 28 }],
    };
  });

  return (
    <Animated.View style={[style, { position: 'absolute', left: 0 }]} className="items-center">
      <View className="items-center">
        <View className="relative">
          <ParticipantAvatar
            name={participant.name}
            color={participant.avatarColor}
            size="sm"
            isHost={participant.isHost}
          />
          {runStatus ? (
            <View className="absolute -right-3 top-0">
              <RunStatusChip text={runStatusLabel(runStatus)} />
            </View>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
});
