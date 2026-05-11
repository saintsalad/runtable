import { memo, useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';

type RunTableMapPinProps = {
  paceBracket: string;
  routeLabel: string;
  hostName: string;
  hostColor: string;
  selected: boolean;
};

export const RunTableMapPin = memo(function RunTableMapPin({
  paceBracket,
  routeLabel,
  hostName,
  hostColor,
  selected,
}: RunTableMapPinProps) {
  const t = useThemeTokens();

  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(withTiming(-3, { duration: 2000 }), withTiming(0, { duration: 2000 })),
      -1,
      true
    );
  }, [translateY]);

  useEffect(() => {
    if (selected) {
      scale.value = withSequence(
        withSpring(1.18, { damping: 8, stiffness: 280 }),
        withSpring(1.06, { damping: 16, stiffness: 220 })
      );
    } else {
      scale.value = withSpring(1, { damping: 14, stiffness: 200 });
    }
  }, [selected, scale]);

  const rootAnim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const routeShort = routeLabel.length > 14 ? `${routeLabel.slice(0, 12)}…` : routeLabel;
  const initials = hostName
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const bubbleBg =
    t.mode === 'dark' ? 'rgba(18, 18, 20, 0.88)' : 'rgba(255, 255, 255, 0.92)';

  return (
    <Animated.View style={[rootAnim, { alignItems: 'center' }]}>
      {/* Compact pill bubble */}
      <View
        style={{
          backgroundColor: bubbleBg,
          borderRadius: 8,
          paddingHorizontal: 9,
          paddingVertical: 5,
          marginBottom: 5,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          borderWidth: 1,
          borderColor: selected
            ? hostColor
            : t.mode === 'dark'
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(0,0,0,0.08)',
          shadowColor: selected ? hostColor : '#000',
          shadowOpacity: selected ? 0.3 : 0.12,
          shadowRadius: selected ? 10 : 5,
          shadowOffset: { width: 0, height: 2 },
          elevation: selected ? 8 : 4,
        }}>
        {/* Color dot */}
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: hostColor,
          }}
        />
        <View>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: 'IBMPlexMono_600SemiBold',
              color: t.text,
              fontSize: 9,
              letterSpacing: 0.2,
            }}>
            {routeShort}
          </Text>
          <Text
            style={{
              fontFamily: 'IBMPlexMono_400Regular',
              color: t.muted,
              fontSize: 7.5,
              marginTop: 1,
            }}>
            {paceBracket}
          </Text>
        </View>
        {/* Tail triangle */}
        <View
          style={{
            position: 'absolute',
            bottom: -5,
            alignSelf: 'center',
            width: 8,
            height: 5,
            overflow: 'hidden',
          }}>
          <View
            style={{
              width: 8,
              height: 8,
              backgroundColor: bubbleBg,
              borderBottomWidth: 1,
              borderRightWidth: 1,
              borderColor: selected
                ? hostColor
                : t.mode === 'dark'
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.08)',
              transform: [{ rotate: '45deg' }, { translateX: 0.5 }, { translateY: -4.5 }],
            }}
          />
        </View>
      </View>

      {/* Avatar dot */}
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: hostColor,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: selected ? 2 : 1.5,
          borderColor: '#fff',
          shadowColor: selected ? hostColor : '#000',
          shadowOpacity: selected ? 0.4 : 0.2,
          shadowRadius: selected ? 8 : 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: selected ? 8 : 4,
        }}>
        <Text
          style={{
            fontFamily: 'IBMPlexMono_600SemiBold',
            color: '#fff',
            fontSize: 9,
          }}>
          {initials}
        </Text>
      </View>

      {/* Stem dot */}
      <View
        style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: hostColor,
          marginTop: 2,
          opacity: 0.55,
        }}
      />
    </Animated.View>
  );
});
