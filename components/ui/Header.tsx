import type { ReactNode } from 'react';
import { memo } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';

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

  return (
    <View
      className="border-b border-runtable-border bg-runtable-bg px-4"
      style={{ paddingTop: insets.top + 8, paddingBottom: 12 }}>
      <View className="flex-row items-center">
        <View className="w-[28%] items-start justify-center">
          {hideBack ? <View style={{ height: 24 }} /> : <BackButton onPress={onBackPress} />}
        </View>
        <View className="w-[44%] items-center px-1">
          <Text
            className="text-center font-pixel text-[10px] uppercase leading-snug tracking-receipt text-runtable-text"
            numberOfLines={2}>
            {title}
          </Text>
        </View>
        <View className="w-[28%] items-end justify-center">{right}</View>
      </View>
    </View>
  );
});
