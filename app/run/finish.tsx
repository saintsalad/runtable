import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { PixelButton } from '@/components/ui/PixelButton';
import { ThermalCard } from '@/components/ui/ThermalCard';
import { DottedDivider } from '@/components/ui/DottedDivider';
import { buildReceiptParticipantLines } from '@/lib/receiptFormat';
import { useRunTableStore } from '@/store';
import type { Receipt } from '@/types';

function formatDurationReceipt(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function formatClockShort(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
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
  const leaderboard = useRunTableStore((s) => s.leaderboard);
  const addReceipt = useRunTableStore((s) => s.addReceipt);
  const resetActiveRun = useRunTableStore((s) => s.resetActiveRun);

  const hostName = participants.find((p) => p.id === hostId)?.name ?? authUser.displayName;

  const paceSummary = useMemo(() => {
    if (!draftRun) return "MOD ZONE · MOCK PACE";
    const map: Record<string, string> = {
      easy: "EASY · 06'20\" AVG",
      moderate: "MOD · 05'52\" AVG",
      tempo: "TMP · 05'12\" AVG",
      fast: "FAST · 04'40\" AVG",
    };
    return map[draftRun.paceZone] ?? 'PACK AVG';
  }, [draftRun]);

  const weather = useMemo(() => {
    const w = ['NIGHT · 26°C', 'HUMID · 29°C', 'DRY · 28°C'];
    return w[participants.length % w.length]!;
  }, [participants.length]);

  const finish = (closeOnly: boolean) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (closeOnly) {
      router.back();
      return;
    }
    const lines = buildReceiptParticipantLines(leaderboard.length ? leaderboard : []);
    const receipt: Receipt = {
      id: `rc-${Date.now()}`,
      routeName: (routeName || 'RUNTABLE SESSION').toUpperCase(),
      distanceKm,
      durationLabel: formatDurationReceipt(Math.max(elapsedMs, 1000)),
      paceSummary,
      completedAt: new Date().toISOString(),
      hostName,
      participantIds: participants.map((p) => p.id),
      participantLines: lines.length
        ? lines
        : participants.map((p, idx) => ({
            rank: idx + 1,
            displayName: p.name.toUpperCase(),
            paceQuote: "06'05\"",
          })),
      runnerCountLabel: `${participants.length} PARTICIPANTS`,
      polylineId,
      weatherLabel: weather,
      badges: [
        { id: '1', label: 'CHECKPOINT' },
        { id: '2', label: 'PACK SYNC' },
        { id: '3', label: 'ARCHIVE READY' },
      ],
    };
    addReceipt(receipt);
    resetActiveRun();
    useRunTableStore.getState().setLastReceiptPreviewId(receipt.id);
    router.replace({ pathname: '/run/receipt', params: { id: receipt.id } });
  };

  return (
    <View className="flex-1 justify-end bg-black/90">
      <View className="w-full px-5 pb-10">
        <ThermalCard elevated className="border-white/20 px-6 py-8">
          <Text
            style={{ fontFamily: 'IBMPlexMono_400Regular' }}
            className="text-center text-[10px] uppercase tracking-[0.45em] text-runtable-faint">
            CHECKPOINT
          </Text>
          <Text
            style={{ fontFamily: 'PressStart2P_400Regular' }}
            className="mt-4 text-center text-[12px] leading-relaxed tracking-widest text-runtable-text">
            SESSION END?
          </Text>
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-3 text-center text-[11px] text-runtable-muted">
            {participants.length} RUNNERS · MOCK CONFIRMATION
          </Text>

          <DottedDivider className="my-6" />

          <View className="flex-row gap-3">
            <View className="flex-1 border border-runtable-border bg-black px-4 py-3">
              <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[9px] uppercase tracking-[0.3em] text-runtable-faint">
                DIST
              </Text>
              <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="mt-2 text-[18px] text-runtable-text">
                {distanceKm.toFixed(2)}
              </Text>
              <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-1 text-[9px] text-runtable-muted">
                KM
              </Text>
            </View>
            <View className="flex-1 border border-runtable-border bg-black px-4 py-3">
              <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[9px] uppercase tracking-[0.3em] text-runtable-faint">
                TIME
              </Text>
              <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="mt-2 text-[18px] text-runtable-text">
                {formatClockShort(elapsedMs)}
              </Text>
            </View>
          </View>

          <PixelButton variant="outline" className="mt-6 border-runtable-border" label="KEEP RUNNING" onPress={() => finish(true)} />

          <PixelButton variant="solid" className="mt-4" label="FINISH RUN" onPress={() => finish(false)} />
        </ThermalCard>
      </View>
    </View>
  );
}
