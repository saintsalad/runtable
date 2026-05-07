import { Stack } from 'expo-router';

import { RUNTABLE_COLORS } from '@/constants/runtable';

export default function ProfileStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        gestureEnabled: true,
        animationDuration: 240,
        contentStyle: { backgroundColor: RUNTABLE_COLORS.bg },
      }}
    />
  );
}
