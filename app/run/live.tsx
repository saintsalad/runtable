import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Pause, Play, StepBack } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { LeaderboardItem } from '@/components/LeaderboardItem';
import { PackTracker } from '@/components/run/PackTracker';
import { Header } from '@/components/ui/Header';
import { ThermalCard } from '@/components/ui/ThermalCard';
import { DottedDivider } from '@/components/ui/DottedDivider';
import { useLiveRealtime } from '@/hooks/useMockRealtime';
import { useRunTableStore } from '@/store';

const GLYPHS = ['◇', '◆', '▓', '▪'];

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
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }, [elapsedMs]);

  const progressKm = useMemo(() => {
    const vals = participants.map((p) => (packPositions[p.id] ?? 0) * distanceKm);
    if (!vals.length) return distanceKm * 0.18;
    return Math.max(...vals);
  }, [distanceKm, packPositions, participants]);

  const openFinish = useCallback(() => router.push('/run/finish'), [router]);

  return (
    <View className="flex-1 bg-runtable-bg">
      <Header title="LIVE · PACK" onBackPress={() => router.back()} />

      <View className="px-6 pb-3 pt-1">
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[10px] uppercase tracking-[0.35em] text-runtable-faint">
          ELAPSED
        </Text>
        <View className="mt-2 flex-row items-end justify-between">
          <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[36px] text-runtable-text">
            {formattedTime}
          </Text>
          <View className="items-end">
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[9px] uppercase tracking-[0.3em] text-runtable-faint">
              PULSE / KM
            </Text>
            <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[13px] text-runtable-muted">
              {currentPaceLabel}
            </Text>
          </View>
        </View>
      </View>

      <ThermalCard className="mx-6 mb-4 border-runtable-border p-4">
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mb-4 text-[10px] uppercase tracking-[0.3em] text-runtable-muted">
          HORIZONTAL PACK TRACK
        </Text>
        <PackTracker participants={participants} positions={packPositions} height={118} />
        <DottedDivider className="mt-6" />
        <View className="mt-4 flex-row justify-between">
          <View>
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[9px] uppercase text-runtable-faint">
              MOCK DIST
            </Text>
            <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[13px] text-runtable-text">
              {progressKm.toFixed(2)} KM
            </Text>
          </View>
          <View className="items-end">
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[9px] uppercase text-runtable-faint">
              TARGET
            </Text>
            <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[13px] text-runtable-text">
              {distanceKm.toFixed(2)} KM
            </Text>
          </View>
        </View>
      </ThermalCard>

      <View className="flex-1 px-6 pb-52">
        <View className="mb-3 flex-row items-center justify-between">
          <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[11px] uppercase tracking-[0.28em] text-runtable-muted">
            ORDER WINDOW
          </Text>
          <Pressable hitSlop={8} onPress={() => setSheetOpen((v) => !v)}>
            <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[10px] uppercase text-runtable-faint">
              {sheetOpen ? 'CLOSE STATS' : 'OPEN STATS'}
            </Text>
          </Pressable>
        </View>
        {leaderboard.slice(0, 5).map((entry) => (
          <LeaderboardItem key={entry.participantId} entry={entry} />
        ))}
        {sheetOpen ? (
          <ThermalCard className="mt-4 p-4">
            <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[11px] uppercase text-runtable-muted">
              PACK METRICS · MOCK STREAM
            </Text>
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-2 text-[10px] text-runtable-faint">
              BELIEVABLE JITTERS ONLY — NO GPS LOCK
            </Text>
            <View className="mt-4 gap-3">
              {participants.slice(0, 6).map((p) => (
                <View
                  key={p.id}
                  className="flex-row items-center justify-between border border-runtable-border bg-runtable-surface px-3 py-2">
                  <View>
                    <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[11px] uppercase text-runtable-text">
                      {p.name}
                    </Text>
                    <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[9px] text-runtable-faint">
                      POSITION DRIFT MOCK
                    </Text>
                  </View>
                  <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[11px] text-runtable-muted">
                    {((packPositions[p.id] ?? 0) * 100).toFixed(0)}%
                  </Text>
                </View>
              ))}
            </View>
          </ThermalCard>
        ) : null}
      </View>

      <View className="pointer-events-none absolute inset-0 items-center justify-start pt-48">
        {cheerEvents.slice(-6).map((c, idx) => (
          <Text
            key={c.id}
            className="absolute font-mono text-[30px] text-runtable-text"
            style={{ top: 120 + idx * 40, opacity: 0.55 }}>
            {c.glyph}
          </Text>
        ))}
      </View>

      <View className="absolute bottom-0 left-0 right-0 border-t border-runtable-border bg-runtable-bg px-6 pb-6 pt-3">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-14 w-14 items-center justify-center border border-runtable-border bg-runtable-card active:opacity-80">
            <StepBack color="#CFCFCF" size={22} strokeWidth={1.3} />
          </Pressable>
          <Pressable
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              togglePause();
            }}
            className="h-14 w-14 items-center justify-center border border-runtable-border bg-runtable-surface active:opacity-80">
            {paused ? <Play color="#FFFFFF" size={22} /> : <Pause color="#FFFFFF" size={22} />}
          </Pressable>
          <Pressable
            onPress={() => {
              void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              const g = GLYPHS[(cheerEvents.length + formattedTime.length) % GLYPHS.length] ?? '◇';
              addCheer(g);
            }}
            className="h-14 w-14 items-center justify-center border border-runtable-border bg-runtable-card active:opacity-80">
            <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[16px] text-runtable-text">
              !
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={openFinish}
          className="mt-4 border border-runtable-border py-4 active:bg-runtable-surface">
          <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-center text-[11px] uppercase tracking-[0.32em] text-runtable-muted">
            END RUN
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
