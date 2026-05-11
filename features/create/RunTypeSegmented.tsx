import * as Haptics from 'expo-haptics';
import { MapPin, Wifi } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';

export type RunType = 'IRL' | 'VIRTUAL';

type RunTypeSegmentedProps = {
  value: RunType;
  onChange: (t: RunType) => void;
};

export const RunTypeSegmented = memo(function RunTypeSegmented({ value, onChange }: RunTypeSegmentedProps) {
  const t = useThemeTokens();

  const options: { id: RunType; label: string; sub: string; Icon: typeof MapPin }[] = [
    { id: 'IRL', label: 'IRL RUN', sub: 'PHYSICAL MEETUP', Icon: MapPin },
    { id: 'VIRTUAL', label: 'VIRTUAL', sub: 'REMOTE SYNC', Icon: Wifi },
  ];

  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {options.map(({ id, label, sub, Icon }) => {
        const active = value === id;
        return (
          <Pressable
            key={id}
            onPress={() => {
              void Haptics.selectionAsync();
              onChange(id);
            }}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: active ? t.text : t.border,
              backgroundColor: active ? t.surface : t.card,
              borderRadius: 6,
              padding: 14,
              alignItems: 'center',
              gap: 6,
            }}
            className="active:opacity-70">
            <Icon color={active ? t.text : t.faint} size={18} strokeWidth={1.4} />
            <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: active ? t.text : t.faint, fontSize: 10, textTransform: 'uppercase', letterSpacing: 2 }}>
              {label}
            </Text>
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, fontSize: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              {sub}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});
