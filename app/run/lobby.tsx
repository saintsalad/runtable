import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { QrCode, Share2 } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CapacityBar } from '@/components/CapacityBar';
import { LobbyList } from '@/components/run/LobbyList';
import { PixelButton } from '@/components/ui/PixelButton';
import { Header } from '@/components/ui/Header';
import { ThermalCard } from '@/components/ui/ThermalCard';
import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';
import { FREE_TIER_MAX_PARTICIPANTS } from '@/constants/runtable';
import { useLobbyRealtime } from '@/hooks/useMockRealtime';
import { useSessionPermissions } from '@/hooks/useSessionPermissions';
import { useThemedTw } from '@/hooks/useThemedTw';
import { useRunTableStore } from '@/store';
import type { RunMood } from '@/types';

const RUN_MOODS: RunMood[] = ['CHILL', 'TEMPO', 'RECOVERY', 'CHAOTIC', 'LOCKED IN'];

function roomCode(runId: string | null): string {
  const d = runId?.replace(/\D/g, '').slice(-4) ?? '0000';
  return `RT-${d.padStart(4, '0')}`;
}

export default function LobbyScreen() {
  const router = useRouter();
  const participants = useRunTableStore((s) => s.participants);
  const maxParticipants = useRunTableStore((s) => s.maxParticipants);
  const routeName = useRunTableStore((s) => s.currentRouteName);
  const hostId = useRunTableStore((s) => s.lobbyHostId);
  const currentRunId = useRunTableStore((s) => s.currentRunId);
  const hostCancelWaitingSession = useRunTableStore((s) => s.hostCancelWaitingSession);
  const sessionPhase = useRunTableStore((s) => s.sessionPhase);
  const toggleReady = useRunTableStore((s) => s.toggleReady);
  const setParticipantMood = useRunTableStore((s) => s.setParticipantMood);
  const authUser = useRunTableStore((s) => s.authUser);

  const { canCancelWaitingSession, canStartSessionFromLobby } = useSessionPermissions();

  useLobbyRealtime(
    (sessionPhase === 'WAITING' || sessionPhase === 'COUNTDOWN') && participants.length > 0,
    hostId
  );

  const latestId = participants[participants.length - 1]?.id ?? null;
  const code = useMemo(() => roomCode(currentRunId), [currentRunId]);

  const selfParticipant = participants.find((p) => p.id === authUser.id);

  const t = useThemeTokens();
  const tw = useThemedTw();

  return (
    <View className={`flex-1 ${tw.bg}`}>
      <Header title="LOBBY" />
      <View className="px-6 pt-2">
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className={`text-[10px] uppercase tracking-[0.35em] ${tw.faint}`}>
          ROOM SEAT
        </Text>
        <Text
          style={{ fontFamily: 'IBMPlexMono_600SemiBold' }}
          className={`mt-2 text-[22px] uppercase tracking-[0.4em] ${tw.text}`}>
          {code}
        </Text>
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className={`mt-2 text-[12px] uppercase tracking-widest ${tw.muted}`}>
          {routeName || 'UNNAMED RUN'}
        </Text>
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className={`mt-2 text-[10px] ${tw.faint}`}>
          FREE CAP {FREE_TIER_MAX_PARTICIPANTS} · MOCK JOINS ACTIVE · {sessionPhase}
        </Text>
      </View>

      <View className="px-6 py-4">
        <CapacityBar filled={participants.length} capacity={Math.min(maxParticipants, 20)} />
      </View>

      {sessionPhase === 'WAITING' && selfParticipant ? (
        <ThermalCard className="mx-6 mb-3 p-3">
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className={`text-[9px] uppercase tracking-[0.3em] ${tw.faint}`}>
            RUN MOOD · YOU
          </Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {RUN_MOODS.map((m) => (
              <PixelButton
                key={m}
                variant={selfParticipant.runMood === m ? 'solid' : 'outline'}
                label={m === 'LOCKED IN' ? 'LOCKED\nIN' : m}
                className="min-w-[30%] flex-1 px-1 py-2"
                onPress={() => {
                  void Haptics.selectionAsync();
                  setParticipantMood(selfParticipant.id, m);
                }}
              />
            ))}
          </View>
        </ThermalCard>
      ) : null}

      <ThermalCard className="mx-6 mb-4 p-4">
        <View className="flex-row items-center gap-4">
          <View
            className={`h-24 w-24 items-center justify-center border-2 border-dashed ${tw.border} ${tw.card}`}>
            <QrCode color={t.muted} size={36} strokeWidth={1.2} />
          </View>
          <View className="flex-1">
            <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className={`text-[11px] uppercase tracking-widest ${tw.text}`}>
              JOIN ANCHOR
            </Text>
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className={`mt-2 text-[10px] ${tw.faint}`}>
              MOCK DEEP LINK PLACEHOLDER
            </Text>
            <Pressable
              onPress={() => void Haptics.selectionAsync()}
              className={`mt-4 flex-row items-center gap-2 self-start border px-3 py-2 active:opacity-80 ${tw.border}`}>
              <Share2 color={t.muted} size={16} strokeWidth={1.3} />
              <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className={`text-[10px] uppercase ${tw.muted}`}>
                INVITE
              </Text>
            </Pressable>
          </View>
        </View>
      </ThermalCard>

      <View className="flex-row items-center justify-between px-6 pb-2">
        <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className={`text-[10px] uppercase tracking-[0.28em] ${tw.muted}`}>
          PACK ROSTER
        </Text>
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className={`text-[9px] ${tw.faint}`}>
          TAP ROW TO TOGGLE READY
        </Text>
      </View>

      <View className="flex-1">
        <LobbyList
          participants={participants}
          latestParticipantId={latestId}
          onToggleReady={(id) => toggleReady(id)}
        />
      </View>

      <View
        style={{ borderTopColor: t.border, backgroundColor: t.background }}
        className="absolute bottom-0 left-0 right-0 gap-3 border-t px-6 pb-10 pt-4">
        <PixelButton
          variant="outline"
          label="TOGGLE MY READY"
          onPress={() => {
            if (selfParticipant) toggleReady(selfParticipant.id);
          }}
        />
        {canCancelWaitingSession ? (
          <PixelButton
            variant="outline"
            label="CANCEL SESSION"
            onPress={() => {
              void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              hostCancelWaitingSession();
              router.replace('/');
            }}
          />
        ) : null}
        <PixelButton
          variant="solid"
          label="START SESSION"
          disabled={!canStartSessionFromLobby}
          onPress={() => {
            if (!canStartSessionFromLobby) return;
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.push('/run/countdown');
          }}
        />
      </View>
    </View>
  );
}
