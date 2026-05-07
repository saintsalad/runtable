import type { ReactNode } from 'react';
import { memo } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';

type HeaderProps = {
  title: string;
  right?: ReactNode;
  /** Root surfaces hide the caret to avoid a useless back affordance. */
  hideBack?: boolean;
  onBackPress?: () => void;
};

export const Header = memo(function Header({
  title,
  right,
  hideBack,
  onBackPress,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const t = useThemeTokens();

  return (
    <View
      className="px-4"
      style={{
        paddingTop: insets.top + 8,
        paddingBottom: 12,
        backgroundColor: t.backgroundElevated,
        borderBottomWidth: 1,
        borderBottomColor: t.border,
      }}>
      <View className="flex-row items-center">
        <View className="w-[28%] items-start justify-center">
          {hideBack ? <View style={{ height: 24 }} /> : <BackButton onPress={onBackPress} />}
        </View>
        <View className="w-[44%] items-center px-1">
          <Text
            className="text-center font-pixel text-[10px] uppercase leading-snug tracking-receipt"
            style={{ color: t.text }}
            numberOfLines={2}>
            {title}
          </Text>
        </View>
        <View className="w-[28%] items-end justify-center">{right}</View>
      </View>
    </View>
  );
});
