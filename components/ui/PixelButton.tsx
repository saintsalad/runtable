import * as Haptics from 'expo-haptics';
import type { PropsWithChildren, ReactNode } from 'react';
import { memo, useCallback } from 'react';
import { Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const APressable = Animated.createAnimatedComponent(Pressable);

const SPRING = { damping: 20, stiffness: 340 } as const;

type PixelButtonProps = PropsWithChildren<{
  label?: string;
  onPress: () => void;
  variant?: 'solid' | 'outline' | 'ghost';
  className?: string;
  disabled?: boolean;
  haptics?: boolean;
  textClassName?: string;
}>;

export const PixelButton = memo(function PixelButton({
  label,
  onPress,
  variant = 'solid',
  className = '',
  disabled,
  haptics = true,
  children,
  textClassName = '',
}: PixelButtonProps) {
  const scaleY = useSharedValue(1);

  const animated = useAnimatedStyle(() => ({
    transform: [{ scaleY: scaleY.value }],
    opacity: disabled ? 0.45 : 1,
  }));

  const handlePressIn = useCallback(() => {
    scaleY.value = withSpring(0.96, SPRING);
    if (haptics && !disabled) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [disabled, haptics, scaleY]);

  const handlePressOut = useCallback(() => {
    scaleY.value = withSpring(1, SPRING);
  }, [scaleY]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    void Haptics.selectionAsync();
    onPress();
  }, [disabled, onPress]);

  const variants = {
    solid: 'border border-white bg-white',
    outline: 'border border-runtable-border bg-runtable-card',
    ghost: 'border border-transparent bg-transparent',
  }[variant];

  const labelTone =
    variant === 'solid'
      ? 'text-runtable-bg font-mono-semibold uppercase'
      : 'text-runtable-text font-mono-semibold uppercase';

  let body: ReactNode = children;
  if (!body && label != null) {
    body = (
      <Text className={`text-center text-[11px] tracking-thermal ${labelTone} ${textClassName}`}>
        {label}
      </Text>
    );
  }

  return (
    <APressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={animated}
      disabled={disabled}
      className={`px-5 py-3.5 active:opacity-95 ${variants} ${className}`}>
      {body}
    </APressable>
  );
});
