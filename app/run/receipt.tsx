import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

import { ReceiptShareOverlay } from '@/components/receipt/ReceiptShareOverlay';
import { ReceiptSlipBody } from '@/components/receipt/ReceiptSlipBody';
import { NoiseOverlay } from '@/components/ui/NoiseOverlay';
import { ScanlineOverlay } from '@/components/ui/ScanlineOverlay';
import { Header } from '@/components/ui/Header';
import { ReceiptPaper } from '@/components/ui/ReceiptPaper';
import { PixelButton } from '@/components/ui/PixelButton';
import { ThermalCard } from '@/components/ui/ThermalCard';
import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';
import { useThemedTw } from '@/hooks/useThemedTw';
import { useRunTableStore } from '@/store';

export default function RunReceiptScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const receipts = useRunTableStore((s) => s.receipts);
  const t = useThemeTokens();
  const tw = useThemedTw();
  const [shareOpen, setShareOpen] = useState(false);

  const offsetY = useSharedValue(620);
  const drift = useSharedValue(0);
  const scan = useSharedValue(0);

  useEffect(() => {
    offsetY.value = withSpring(0, { damping: 16, stiffness: 88 });
    drift.value = withSequence(withTiming(2.5, { duration: 60 }), withTiming(0, { duration: 380 }));
    scan.value = withTiming(1, { duration: 980, easing: Easing.out(Easing.cubic) });
  }, [drift, offsetY, scan]);

  const slipStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offsetY.value }, { translateX: drift.value }],
  }));

  const scanStyle = useAnimatedStyle(() => ({
    opacity: 0.12 * (1 - scan.value),
  }));

  const receipt = useMemo(() => {
    if (id) return receipts.find((r) => r.id === id);
    return receipts[0];
  }, [id, receipts]);

  if (!receipt) {
    return (
      <View style={{ flex: 1, backgroundColor: t.background }} className="items-center justify-center px-8">
        <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className={`text-[13px] uppercase ${tw.text}`}>
          NO RECEIPT YET
        </Text>
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className={`mt-4 text-center text-[11px] ${tw.faint}`}>
          FINISH A RUN TO MINT A THERMAL TICKET OR START CONFIG FROM HOME.
        </Text>
      </View>
    );
  }

  const distLabel = `${receipt.distanceKm.toFixed(2).padStart(5, '0')} KM`;

  let stampDate: string;
  try {
    stampDate = new Date(receipt.completedAt).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    stampDate = receipt.completedAt;
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <NoiseOverlay opacity={0.035} />
      <ScanlineOverlay step={6} />

      <Header title="GROUP RECEIPT" onBackPress={() => router.replace('/')} />

      <ScrollView contentContainerStyle={{ paddingBottom: 48, paddingTop: 12 }} className="flex-1 px-4">
        <View className="relative items-center">
          <Animated.View style={scanStyle} className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-white" />
          <Animated.View style={slipStyle} className="w-full max-w-[360px]">
            <ReceiptPaper>
              <ReceiptSlipBody receipt={receipt} stampDate={stampDate} distLabel={distLabel} />
            </ReceiptPaper>
          </Animated.View>
        </View>

        <ThermalCard className="mx-4 mt-8 px-5 py-4">
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className={`text-[10px] uppercase tracking-[0.32em] ${tw.muted}`}>
            PRINTER CONTROLS
          </Text>
          <View className="mt-4 gap-3">
            <PixelButton
              variant="solid"
              label="SAVE SLIP"
              onPress={() => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
            />
            <PixelButton
              variant="outline"
              label="SHARE PREVIEW"
              onPress={() => {
                void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setShareOpen(true);
              }}
            />
            <PixelButton variant="outline" label="SHARE ROUTE MEMORY" onPress={() => void Haptics.selectionAsync()} />
            <PixelButton variant="outline" disabled label="STRAVA" onPress={() => undefined} />
          </View>
        </ThermalCard>
      </ScrollView>

      <ReceiptShareOverlay
        visible={shareOpen}
        onClose={() => setShareOpen(false)}
        receipt={receipt}
        stampDate={stampDate}
        distLabel={distLabel}
      />
    </View>
  );
}
