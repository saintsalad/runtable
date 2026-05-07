import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Pause, Play, SmilePlus, StepBack } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/GlassCard';
import { LeaderboardItem } from '@/components/LeaderboardItem';
import { PackTrack } from '@/features/live/PackTrack';
import { useLiveRealtime } from '@/hooks/useMockRealtime';
import { useRunTableStore } from '@/store';

const CHEERS = ['🔥', '⚡', '✨', '💚', '🙌', '✌️'];

export default function LiveRunScreen() {
  const router = useRouter();
  const participants = useRunTableStore((s) => s.participants);
  const distanceKm = useRunTableStore((s) => s.currentDistanceKm);
  const packPositions = useRunTableStore((s) => s.packPositions);
  const leaderboard = useRunTableStore((s) => s.leaderboard);
  const elapsedMs = useRunTableStore((s) => s.elapsedMs);
  const paused = useRunTableStore((s) => s.paused);
  const currentPaceLabel = useRunTableStore((s) => s.currentPaceLabel);
  const cheerEvents = useRunTableStore((s) => s.cheerEvents);
  const togglePause = useRunTableStore((s) => s.togglePause);
  const addCheer = useRunTableStore((s) => s.addCheer);

  const [sheetOpen, setSheetOpen] = useState(false);

  useLiveRealtime(true, distanceKm);

  const formattedTime = useMemo(() => {
    const s = Math.floor(elapsedMs / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }, [elapsedMs]);

  const openFinish = useCallback(() => router.push('/run/finish'), [router]);

  return (
    <SafeAreaView className="flex-1 bg-runtable-bg" edges={['top']}>
      <View className="px-6 pb-3 pt-3">
        <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-runtable-muted">Live pack</Text>
        <View className="mt-2 flex-row items-end justify-between">
          <Text className="text-4xl font-black text-white">{formattedTime}</Text>
          <View className="items-end">
            <Text className="text-xs text-runtable-muted">Pace pulse</Text>
            <Text className="text-lg font-semibold text-runtable-accent">{currentPaceLabel}</Text>
          </View>
        </View>
      </View>

      <GlassCard className="mx-6 mb-4 overflow-hidden">
        <View className="p-4">
          <Text className="text-sm text-runtable-muted">Route energy</Text>
          <PackTrack participants={participants} positions={packPositions} />
        </View>
      </GlassCard>

      <View className="px-6">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-white">Leaderboard</Text>
          <Pressable onPress={() => setSheetOpen((v) => !v)}>
            <Text className="text-sm font-semibold text-runtable-accent">{sheetOpen ? 'Hide' : 'Stats'}</Text>
          </Pressable>
        </View>
        {leaderboard.slice(0, 5).map((entry) => (
          <LeaderboardItem key={entry.participantId} entry={entry} />
        ))}
      </View>

      {sheetOpen ? (
        <View className="mt-4 px-6">
          <GlassCard className="p-4">
            <Text className="text-lg font-semibold text-white">Pack stats</Text>
            <Text className="mt-1 text-sm text-runtable-muted">
              Distance is approximate — tuned for social energy, not splits.
            </Text>
            <View className="mt-4 gap-3">
              {participants.slice(0, 6).map((p) => (
                <View
                  key={p.id}
                  className="flex-row items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-3 py-2">
                  <View>
                    <Text className="font-semibold text-white">{p.name}</Text>
                    <Text className="text-xs text-runtable-muted">Streak cheers · On pace</Text>
                  </View>
                  <Text className="text-sm font-semibold text-runtable-accent">
                    {(packPositions[p.id] ?? 0) * distanceKm < 0.4 * distanceKm
                      ? 'Warmup'
                      : (packPositions[p.id] ?? 0) * distanceKm < 0.75 * distanceKm
                        ? 'Locked in'
                        : 'Closing'}
                  </Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </View>
      ) : null}

      <View className="pointer-events-none absolute inset-0 items-center justify-start pt-52">
        {cheerEvents.slice(-6).map((c, idx) => (
          <Text
            key={c.id}
            className="absolute text-4xl"
            style={{ top: 120 + idx * 36, transform: [{ rotate: `${(idx % 2) * 6}deg` }] }}>
            {c.emoji}
          </Text>
        ))}
      </View>

      <View className="mt-auto flex-row items-center justify-between px-6 pb-4">
        <Pressable
          onPress={() => router.back()}
          className="h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-runtable-card active:opacity-90">
          <StepBack color="#94A3B8" size={22} />
        </Pressable>
        <Pressable
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            togglePause();
          }}
          className="h-14 w-14 items-center justify-center rounded-2xl border border-runtable-accent/40 bg-runtable-accent/15 active:opacity-90">
          {paused ? <Play color="#7CFF6B" size={22} /> : <Pause color="#7CFF6B" size={22} />}
        </Pressable>
        <Pressable
          onPress={() => {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const emoji = CHEERS[(cheerEvents.length + formattedTime.length) % CHEERS.length]!;
            addCheer(emoji);
          }}
          className="h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-runtable-card active:opacity-90">
          <SmilePlus color="#7CFF6B" size={22} />
        </Pressable>
      </View>

      <View className="px-6 pb-8">
        <Pressable
          onPress={openFinish}
          className="rounded-3xl border border-white/10 py-4 active:bg-white/5">
          <Text className="text-center text-base font-semibold text-white">End run</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
