import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { memo, useCallback } from 'react';
import { Pressable, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const SPRING = { damping: 20, stiffness: 320 } as const;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type BackButtonProps = {
  onPress?: () => void;
};

export const BackButton = memo(function BackButton({ onPress }: BackButtonProps) {
  const router = useRouter();
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 0.92,
  }));

  const handleIn = useCallback(() => {
    scale.value = withSpring(0.94, SPRING);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [scale]);

  const handleOut = useCallback(() => {
    scale.value = withSpring(1, SPRING);
  }, [scale]);

  const handlePress = useCallback(() => {
    void Haptics.selectionAsync();
    if (onPress) {
      onPress();
      return;
    }
    if (router.canGoBack()) router.back();
  }, [onPress, router]);

  return (
    <AnimatedPressable
      onPressIn={handleIn}
      onPressOut={handleOut}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={12}
      style={style}
      className="flex-row items-center">
      <Text className="font-mono text-[12px] uppercase tracking-[0.2em] text-runtable-muted">{`<`}</Text>
      <Text className="ml-1 font-mono text-[11px] uppercase tracking-[0.28em] text-runtable-muted">
        BACK
      </Text>
    </AnimatedPressable>
  );
});
