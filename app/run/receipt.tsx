import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

import { ReceiptParticipants } from '@/components/receipt/ReceiptParticipants';
import { ReceiptRoute } from '@/components/receipt/ReceiptRoute';
import { ReceiptStats } from '@/components/receipt/ReceiptStats';
import { NoiseOverlay } from '@/components/ui/NoiseOverlay';
import { ScanlineOverlay } from '@/components/ui/ScanlineOverlay';
import { Header } from '@/components/ui/Header';
import { ReceiptPaper } from '@/components/ui/ReceiptPaper';
import { PixelButton } from '@/components/ui/PixelButton';
import { ThermalCard } from '@/components/ui/ThermalCard';
import { RUNTABLE_COLORS } from '@/constants/runtable';
import { useRunTableStore } from '@/store';

export default function RunReceiptScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const receipts = useRunTableStore((s) => s.receipts);

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
      <View className="flex-1 items-center justify-center bg-runtable-bg px-8">
        <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[13px] uppercase text-runtable-text">
          NO RECEIPT YET
        </Text>
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-4 text-center text-[11px] text-runtable-faint">
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
    <View className="flex-1 bg-black">
      <NoiseOverlay opacity={0.035} />
      <ScanlineOverlay step={6} />

      <Header title="GROUP RECEIPT" onBackPress={() => router.replace('/')} />

      <ScrollView contentContainerStyle={{ paddingBottom: 48, paddingTop: 12 }} className="flex-1 px-4">
        <View className="relative items-center">
          <Animated.View style={scanStyle} className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-white" />
          <Animated.View style={slipStyle} className="w-full max-w-[360px]">
            <ReceiptPaper>
              <Text
                style={{ fontFamily: 'PressStart2P_400Regular', color: RUNTABLE_COLORS.ink }}
                className="text-center text-[11px] uppercase leading-relaxed">
                RUN TABLE
              </Text>
              <Text
                style={{ fontFamily: 'IBMPlexMono_400Regular', color: RUNTABLE_COLORS.ink }}
                className="mt-3 text-center text-[10px] uppercase tracking-[0.4em]">
                GROUP RUN RECEIPT
              </Text>

              <View className="my-5 h-px bg-black/15" />

              <ReceiptStats
                routeLabel={receipt.routeName}
                distanceLabel={distLabel}
                timeLabel={receipt.durationLabel}
                paceLabel={receipt.paceSummary}
                runnersLabel={
                  receipt.runnerCountLabel ?? `${receipt.participantIds.length} PARTICIPANTS`
                }
              />

              <View className="mt-4">
                <ReceiptRoute polylineId={receipt.polylineId} height={132} />
              </View>

              <ReceiptParticipants lines={receipt.participantLines ?? []} />

              <View className="mt-5 border border-dashed border-black/25 bg-black/5 px-3 py-2">
                <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[9px] uppercase tracking-[0.35em] text-black/50">
                  WEATHER / STAMP
                </Text>
                <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-2 text-[11px] text-runtable-ink">
                  {receipt.weatherLabel ?? '—'}
                </Text>
                <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-2 text-[10px] text-black/45">
                  {stampDate}
                </Text>
              </View>

              <View className="mt-4 flex-row flex-wrap gap-2">
                {receipt.badges.map((b) => (
                  <View key={b.id} className="border border-black/25 px-2 py-1">
                    <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[9px] uppercase text-runtable-ink">
                      {b.label}
                    </Text>
                  </View>
                ))}
              </View>

              <View className="mt-8 items-center border-t border-dashed border-black/20 pt-4">
                <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[9px] uppercase tracking-[0.45em] text-black/40">
                  ··· CUT HERE ···
                </Text>
              </View>
            </ReceiptPaper>
          </Animated.View>
        </View>

        <ThermalCard className="mx-4 mt-8 px-5 py-4">
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[10px] uppercase tracking-[0.32em] text-runtable-muted">
            PRINTER CONTROLS
          </Text>
          <View className="mt-4 gap-3">
            <PixelButton
              variant="solid"
              label="SAVE SLIP"
              onPress={() => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
            />
            <PixelButton variant="outline" label="SHARE ROUTE MEMORY" onPress={() => void Haptics.selectionAsync()} />
            <PixelButton variant="outline" disabled label="STRAVA" onPress={() => undefined} />
          </View>
        </ThermalCard>
      </ScrollView>
    </View>
  );
}
