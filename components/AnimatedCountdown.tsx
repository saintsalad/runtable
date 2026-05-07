import { BlurView } from 'expo-blur';
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

const STEPS = ['3', '2', '1', 'GO'] as const;

type AnimatedCountdownProps = {
  onComplete: () => void;
};

export function AnimatedCountdown({ onComplete }: AnimatedCountdownProps) {
  const [index, setIndex] = useState(0);
  const glow = useSharedValue(0);
  const finished = useRef(false);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.25 + glow.value * 0.7,
    shadowRadius: 10 + glow.value * 32,
  }));

  useEffect(() => {
    if (index >= STEPS.length) {
      if (!finished.current) {
        finished.current = true;
        onComplete();
      }
      return;
    }
    const delay = index === 0 ? 420 : 720;
    const id = setTimeout(() => {
      void Haptics.impactAsync(
        index === STEPS.length - 1
          ? Haptics.ImpactFeedbackStyle.Heavy
          : Haptics.ImpactFeedbackStyle.Medium
      );
      glow.value = withSequence(withTiming(1, { duration: 200 }), withTiming(0, { duration: 380 }));
      setIndex((i) => i + 1);
    }, delay);
    return () => clearTimeout(id);
  }, [glow, index, onComplete]);

  if (index >= STEPS.length) {
    return null;
  }

  const label = STEPS[index];

  return (
    <View className="absolute inset-0 items-center justify-center">
      <BlurView intensity={55} tint="dark" style={{ position: 'absolute', inset: 0 }} />
      <Animated.View
        key={label}
        entering={FadeIn.duration(240)}
        exiting={FadeOut.duration(160)}
        style={glowStyle}
        className="items-center rounded-[40px] px-10 py-8 shadow-2xl shadow-runtable-accent">
        <Text
          className={`text-center font-black text-runtable-accent ${
            label === 'GO' ? 'text-7xl' : 'text-8xl'
          }`}>
          {label}
        </Text>
        <Text className="mt-4 text-sm font-medium text-runtable-muted">Brace the pack energy</Text>
      </Animated.View>
    </View>
  );
}
