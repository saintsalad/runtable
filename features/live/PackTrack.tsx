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
import type { Participant } from '@/types';

type PackTrackProps = {
  participants: Participant[];
  positions: Record<string, number>;
  height?: number;
  onTrackWidth?: (w: number) => void;
};

export const PackTrack = memo(function PackTrack({
  participants,
  positions,
  height = 112,
  onTrackWidth,
}: PackTrackProps) {
  const trackWidth = useSharedValue(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width - 32;
    trackWidth.value = w;
    onTrackWidth?.(w);
  };

  return (
    <View className="w-full" style={{ height }} onLayout={onLayout}>
      <View className="flex-1 justify-center px-4">
        <View className="h-3 overflow-hidden rounded-full bg-white/10">
          <View className="absolute inset-y-0 left-0 w-[18%] rounded-full bg-runtable-accent/35" />
          <View className="absolute inset-y-0 left-[33%] w-[10%] rounded-full bg-white/10" />
          <View className="absolute inset-y-0 right-[22%] w-[12%] rounded-full bg-white/10" />
        </View>
        <View className="absolute inset-x-0" style={{ height }}>
          {participants.map((p) => (
            <RunnerDot
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

const RunnerDot = memo(function RunnerDot({ participant, progress, trackWidth, height }: RunnerDotProps) {
  const progressSv = useSharedValue(progress);

  useEffect(() => {
    progressSv.value = withSpring(progress, { damping: 18, stiffness: 120 });
  }, [progress, progressSv]);

  const style = useAnimatedStyle(() => {
    const w = Math.max(trackWidth.value, 1);
    const x = interpolate(progressSv.value, [0, 1], [12, w - 12]);
    return {
      transform: [{ translateX: x }, { translateY: height / 2 - 28 }],
    };
  });

  return (
    <Animated.View style={[style, { position: 'absolute', left: 0 }]} className="items-center">
      <ParticipantAvatar name={participant.name} color={participant.avatarColor} size="sm" isHost={participant.isHost} />
    </Animated.View>
  );
});
