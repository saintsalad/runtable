import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_600SemiBold,
} from '@expo-google-fonts/ibm-plex-mono';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { useEffect, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { ThemeTokensProvider } from '@/components/theme/ThemeTokensProvider';
import { useSemanticTheme } from '@/hooks/useSemanticTheme';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const queryClient = useMemo(() => new QueryClient(), []);
  const theme = useSemanticTheme();

  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
    IBMPlexMono_400Regular,
    IBMPlexMono_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.background }}>
      <ThemeTokensProvider>
        <BottomSheetModalProvider>
          <QueryClientProvider client={queryClient}>
            <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.background },
              animation: 'slide_from_right',
              gestureEnabled: true,
              animationDuration: 280,
            }}>
            <Stack.Screen name="index" options={{ animation: 'fade', animationDuration: 220 }} />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade', animationDuration: 220 }} />
            <Stack.Screen name="profile" options={{ animation: 'fade', animationDuration: 240 }} />
            <Stack.Screen name="run" options={{ animation: 'slide_from_right', animationDuration: 300 }} />
          </Stack>
            <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
          </QueryClientProvider>
        </BottomSheetModalProvider>
      </ThemeTokensProvider>
    </GestureHandlerRootView>
  );
}
