import * as Haptics from 'expo-haptics';
import type { PropsWithChildren } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type FloatingCTAProps = PropsWithChildren<{
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}>;

const SPRING = { damping: 20, stiffness: 320 } as const;

export function FloatingCTA({
  label,
  onPress,
  variant = 'primary',
  disabled,
  children,
}: FloatingCTAProps) {
  const scaleY = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: scaleY.value }],
    opacity: disabled ? 0.4 : 1,
  }));

  const base =
    variant === 'primary' ? 'border-2 border-white bg-white' : 'border border-runtable-border bg-runtable-card';

  const textColor = variant === 'primary' ? 'text-runtable-bg' : 'text-runtable-text';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className="w-full"
      onPressIn={() => {
        scaleY.value = withSpring(0.96, SPRING);
        if (!disabled) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => {
        scaleY.value = withSpring(1, SPRING);
      }}
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}>
      <Animated.View style={animStyle}>
        <View className={`items-center justify-center px-6 py-5 ${base}`}>
          <Text
            style={{ fontFamily: 'IBMPlexMono_600SemiBold' }}
            className={`text-center text-[12px] uppercase tracking-[0.35em] ${textColor}`}>
            {label}
          </Text>
          {children}
        </View>
      </Animated.View>
    </Pressable>
  );
}
