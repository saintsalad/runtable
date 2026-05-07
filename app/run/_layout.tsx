import { Stack } from 'expo-router';

import { RUNTABLE_COLORS } from '@/constants/runtable';

export default function RunStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: RUNTABLE_COLORS.bg },
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
