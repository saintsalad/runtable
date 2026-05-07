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

export function FloatingCTA({
  label,
  onPress,
  variant = 'primary',
  disabled,
  children,
}: FloatingCTAProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const base =
    variant === 'primary'
      ? 'bg-runtable-accent shadow-lg shadow-runtable-accent/25'
      : 'border border-white/15 bg-runtable-card';

  const textColor = variant === 'primary' ? 'text-runtable-bg' : 'text-white';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={{ width: '100%' }}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 18, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 260 });
      }}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}>
      <Animated.View style={animStyle}>
        <View
          className={`items-center justify-center rounded-3xl px-6 py-5 ${base} ${disabled ? 'opacity-40' : ''}`}>
          <Text className={`text-center text-lg font-semibold ${textColor}`}>{label}</Text>
          {children}
        </View>
      </Animated.View>
    </Pressable>
  );
}
