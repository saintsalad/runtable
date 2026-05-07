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
import { RUNTABLE_COLORS } from '@/constants/runtable';
import type { Participant } from '@/types';

export type PackTrackerProps = {
  participants: Participant[];
  positions: Record<string, number>;
  height?: number;
  onTrackWidth?: (w: number) => void;
};

export const PackTracker = memo(function PackTracker({
  participants,
  positions,
  height = 112,
  onTrackWidth,
}: PackTrackerProps) {
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
          style={{ backgroundColor: RUNTABLE_COLORS.surface }}>
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: '18%',
              top: 2,
              bottom: 2,
              width: 2,
              backgroundColor: RUNTABLE_COLORS.faint,
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
              backgroundColor: RUNTABLE_COLORS.faint,
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
              backgroundColor: RUNTABLE_COLORS.faint,
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
};

const PackRunnerDot = memo(function PackRunnerDot({
  participant,
  progress,
  trackWidth,
  height,
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
      <ParticipantAvatar
        name={participant.name}
        color={participant.avatarColor}
        size="sm"
        isHost={participant.isHost}
      />
    </Animated.View>
  );
});
