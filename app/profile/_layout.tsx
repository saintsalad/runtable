import { Stack } from 'expo-router';

import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';

export default function ProfileStackLayout() {
  const t = useThemeTokens();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        gestureEnabled: true,
        animationDuration: 240,
        contentStyle: { backgroundColor: t.background },
      }}
    />
  );
}
