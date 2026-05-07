import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { NoiseOverlay } from '@/components/ui/NoiseOverlay';
import { ScanlineOverlay } from '@/components/ui/ScanlineOverlay';

const STEPS = ['3', '2', '1', 'RUN'] as const;

type AnimatedCountdownProps = {
  onComplete: () => void;
};

export function AnimatedCountdown({ onComplete }: AnimatedCountdownProps) {
  const [index, setIndex] = useState(0);
  const flash = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const finished = useRef(false);

  const flareStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + flash.value * 0.45,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  useEffect(() => {
    flash.value = withSequence(withTiming(1, { duration: 60 }), withTiming(0.2, { duration: 240 }));
    return undefined;
  }, [flash, index]);

  useEffect(() => {
    if (index >= STEPS.length) {
      if (!finished.current) {
        finished.current = true;
        onComplete();
      }
      return undefined;
    }
    const delay = index === STEPS.length - 1 ? 780 : index === 0 ? 560 : 700;
    const id = setTimeout(() => {
      void Haptics.impactAsync(
        index >= STEPS.length - 2
          ? Haptics.ImpactFeedbackStyle.Heavy
          : Haptics.ImpactFeedbackStyle.Medium
      );
      shakeX.value = withSequence(
        withTiming(12, { duration: 42 }),
        withTiming(-10, { duration: 48 }),
        withTiming(5, { duration: 36 }),
        withTiming(0, { duration: 42 })
      );
      setIndex((i) => i + 1);
    }, delay);
    return () => clearTimeout(id);
  }, [index, onComplete, shakeX]);

  if (index >= STEPS.length) return null;

  const label = STEPS[index];
  const mega = label === 'RUN';

  return (
    <View className="flex-1 bg-black">
      <NoiseOverlay opacity={0.07} />
      <ScanlineOverlay step={4} />

      <Animated.View
        key={label}
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(140)}
        className="flex-1 items-center justify-center px-4">
        <Animated.View style={labelStyle} className="items-center">
          <Animated.View style={flareStyle} className="items-center">
            <Text
              style={{
                fontFamily: 'PressStart2P_400Regular',
                lineHeight: mega ? 78 : 96,
                letterSpacing: 2,
              }}
              className={`text-white ${mega ? 'text-[64px]' : 'text-[76px]'}`}>
              {label}
            </Text>
            <Text
              style={{ fontFamily: 'IBMPlexMono_400Regular' }}
              className="mt-10 text-[10px] uppercase tracking-[0.45em] text-runtable-faint">
              SEQUENCE ARMED
            </Text>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
