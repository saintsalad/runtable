import { Star } from 'lucide-react-native';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type ParticipantAvatarProps = {
  name: string;
  color: string;
  textColor?: string;
  size?: 'sm' | 'md' | 'lg';
  isHost?: boolean;
  pulse?: boolean;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? '?';
  const b = parts[1]?.[0] ?? '';
  return (a + b).toUpperCase();
}

const SIZES = {
  sm: { box: 'h-9 w-9', text: 'text-xs' },
  md: { box: 'h-11 w-11', text: 'text-sm' },
  lg: { box: 'h-14 w-14', text: 'text-base' },
};

export function ParticipantAvatar({
  name,
  color,
  textColor = '#ffffff',
  size = 'md',
  isHost,
  pulse,
}: ParticipantAvatarProps) {
  const ring = useSharedValue(0);

  useEffect(() => {
    if (!pulse) {
      ring.value = 0;
      return;
    }
    ring.value = withRepeat(
      withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 900 })),
      -1
    );
  }, [pulse, ring]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse ? 0.55 + ring.value * 0.45 : 1,
    transform: [{ scale: pulse ? 1 + ring.value * 0.08 : 1 }],
  }));

  const dim = SIZES[size];

  return (
    <View className="items-center justify-center">
      <Animated.View style={pulseStyle}>
        <View
          className={`${dim.box} items-center justify-center rounded-full`}
          style={{ backgroundColor: color }}>
          <Text className={`font-bold ${dim.text}`} style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: textColor }}>{initials(name)}</Text>
        </View>
      </Animated.View>
      {isHost ? (
        <View style={{ position: 'absolute', bottom: -3, right: -3, width: 14, height: 14, borderRadius: 99, backgroundColor: '#facc15', alignItems: 'center', justifyContent: 'center' }}>
          <Star size={8} color="#000" fill="#000" strokeWidth={0} />
        </View>
      ) : null}
    </View>
  );
}
