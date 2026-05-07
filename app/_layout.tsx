import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { RUNTABLE_COLORS } from '@/constants/runtable';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: RUNTABLE_COLORS.bg }}>
      <QueryClientProvider client={queryClient}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: RUNTABLE_COLORS.bg },
          }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="run" />
        </Stack>
        <StatusBar style="light" />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
