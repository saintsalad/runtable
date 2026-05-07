import { Stack } from 'expo-router';

import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';

export default function RunStackLayout() {
  const t = useThemeTokens();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: t.background },
        animation: 'slide_from_right',
      }}>
      <Stack.Screen
        name="finish"
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
    </Stack>
  );
}
