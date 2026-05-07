import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { GlassCard } from '@/components/GlassCard';
import { WEATHER_CHIPS } from '@/mocks/fixtures';
import { useRunTableStore } from '@/store';
import type { Receipt } from '@/types';

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function FinishRunModal() {
  const router = useRouter();
  const elapsedMs = useRunTableStore((s) => s.elapsedMs);
  const distanceKm = useRunTableStore((s) => s.currentDistanceKm);
  const participants = useRunTableStore((s) => s.participants);
  const routeName = useRunTableStore((s) => s.currentRouteName);
  const hostId = useRunTableStore((s) => s.lobbyHostId);
  const polylineId = useRunTableStore((s) => s.currentPolylineId);
  const draftRun = useRunTableStore((s) => s.draftRun);
  const authUser = useRunTableStore((s) => s.authUser);
  const addReceipt = useRunTableStore((s) => s.addReceipt);
  const resetActiveRun = useRunTableStore((s) => s.resetActiveRun);

  const hostName =
    participants.find((p) => p.id === hostId)?.name ?? authUser.displayName;

  const paceSummary = useMemo(() => {
    if (!draftRun) return 'Moderate · group pace';
    const map: Record<string, string> = {
      easy: 'Easy · conversational',
      moderate: 'Moderate · chatty tempo',
      tempo: 'Tempo · focused push',
      fast: 'Fast · sharp turnover',
    };
    return map[draftRun.paceZone] ?? 'Pack pace';
  }, [draftRun]);

  const weather = WEATHER_CHIPS[participants.length % WEATHER_CHIPS.length]!;

  const finish = (closeOnly: boolean) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (closeOnly) {
      router.back();
      return;
    }
    const receipt: Receipt = {
      id: `rc-${Date.now()}`,
      routeName: routeName || 'RunTable Session',
      distanceKm,
      durationLabel: formatDuration(Math.max(elapsedMs, 1000)),
      paceSummary,
      completedAt: new Date().toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      hostName,
      participantIds: participants.map((p) => p.id),
      polylineId,
      weatherLabel: weather,
      badges: [
        { id: '1', label: 'Pack sync' },
        { id: '2', label: 'Cheer cannon' },
        { id: '3', label: 'Neon finish' },
      ],
    };
    addReceipt(receipt);
    resetActiveRun();
    useRunTableStore.getState().setLastReceiptPreviewId(receipt.id);
    router.replace({ pathname: '/run/receipt', params: { id: receipt.id } });
  };

  return (
    <View className="flex-1 justify-end bg-black/70">
      <BlurView intensity={30} tint="dark" style={{ position: 'absolute', inset: 0 }} />
      <GlassCard className="mx-4 mb-10 overflow-hidden rounded-[32px]">
        <View className="gap-2 p-6">
          <Text className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-runtable-muted">
            End run?
          </Text>
          <Text className="text-center text-3xl font-bold text-white">Nice miles.</Text>
          <Text className="text-center text-runtable-muted">
            {participants.length} runners at the table
          </Text>

          <View className="mt-4 flex-row gap-3">
            <View className="flex-1 rounded-2xl bg-white/5 p-4">
              <Text className="text-xs text-runtable-muted">Time</Text>
              <Text className="mt-2 text-2xl font-bold text-white">{formatDuration(elapsedMs)}</Text>
            </View>
            <View className="flex-1 rounded-2xl bg-white/5 p-4">
              <Text className="text-xs text-runtable-muted">Distance</Text>
              <Text className="mt-2 text-2xl font-bold text-white">{distanceKm} km</Text>
            </View>
          </View>

          <Pressable
            onPress={() => finish(true)}
            className="mt-4 rounded-3xl border border-white/15 py-4 active:bg-white/5">
            <Text className="text-center text-base font-semibold text-white">Keep running</Text>
          </Pressable>
          <Pressable
            onPress={() => finish(false)}
            className="rounded-3xl bg-runtable-accent py-4 active:opacity-90">
            <Text className="text-center text-base font-semibold text-runtable-bg">Finish run</Text>
          </Pressable>
        </View>
      </GlassCard>
    </View>
  );
}
