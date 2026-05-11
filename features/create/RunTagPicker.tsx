import * as Haptics from 'expo-haptics';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';

export type RunTag =
  | 'BEGINNER FRIENDLY'
  | 'RECOVERY RUN'
  | 'LONG RUN'
  | 'COFFEE RUN'
  | 'PET FRIENDLY'
  | 'WOMEN ONLY'
  | 'NIGHT RUN'
  | 'TEMPO';

const ALL_TAGS: RunTag[] = [
  'BEGINNER FRIENDLY',
  'RECOVERY RUN',
  'LONG RUN',
  'COFFEE RUN',
  'PET FRIENDLY',
  'WOMEN ONLY',
  'NIGHT RUN',
  'TEMPO',
];

type RunTagPickerProps = {
  selected: RunTag[];
  onChange: (tags: RunTag[]) => void;
};

export const RunTagPicker = memo(function RunTagPicker({ selected, onChange }: RunTagPickerProps) {
  const t = useThemeTokens();

  const toggle = (tag: RunTag) => {
    void Haptics.selectionAsync();
    if (selected.includes(tag)) {
      onChange(selected.filter((x) => x !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {ALL_TAGS.map((tag) => {
        const active = selected.includes(tag);
        return (
          <Pressable
            key={tag}
            onPress={() => toggle(tag)}
            style={{
              borderWidth: 1,
              borderColor: active ? t.text : t.border,
              backgroundColor: active ? t.surface : t.card,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 4,
            }}
            className="active:opacity-70">
            <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: active ? t.text : t.faint, fontSize: 8, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              {tag}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});
