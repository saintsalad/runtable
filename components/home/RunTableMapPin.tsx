import { memo, useEffect } from 'react';
import { Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';

type RunTableMapPinProps = {
  paceBracket: string;
  routeLabel: string;
  selected: boolean;
};

export const RunTableMapPin = memo(function RunTableMapPin({
  paceBracket,
  routeLabel,
  selected,
}: RunTableMapPinProps) {
  const t = useThemeTokens();
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.05, { duration: 1400 }), withTiming(1, { duration: 1400 })),
      -1
    );
  }, [pulse]);

  useEffect(() => {
    if (selected) {
      pulse.value = withSequence(withTiming(1.14, { duration: 180 }), withTiming(1.05, { duration: 220 }));
    }
  }, [selected, pulse]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const routeShort =
    routeLabel.length > 14 ? `${routeLabel.slice(0, 12).toUpperCase()}…` : routeLabel.toUpperCase();

  return (
    <Animated.View
      style={[
        anim,
        {
          borderColor: t.text,
          backgroundColor: t.mode === 'dark' ? 'rgba(20,20,20,0.92)' : 'rgba(250,246,238,0.95)',
          shadowColor: '#000',
          shadowOpacity: t.mode === 'dark' ? 0.45 : 0.15,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 5,
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 8,
          paddingVertical: 5,
          maxWidth: 140,
        },
      ]}>
      <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.muted }} className="text-[8px] uppercase tracking-widest">
        [{paceBracket}]
      </Text>
      <Text
        style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.text }}
        className="mt-0.5 text-[9px] uppercase tracking-tighter">
        {routeShort}
      </Text>
    </Animated.View>
  );
});
