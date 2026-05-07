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
import { FREE_TIER_MAX_PARTICIPANTS } from '@/constants/runtable';
import { useLobbyRealtime } from '@/hooks/useMockRealtime';
import { useRunTableStore } from '@/store';

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
  const toggleReady = useRunTableStore((s) => s.toggleReady);

  useLobbyRealtime(participants.length > 0, hostId);

  const latestId = participants[participants.length - 1]?.id ?? null;
  const code = useMemo(() => roomCode(currentRunId), [currentRunId]);

  return (
    <View className="flex-1 bg-runtable-bg">
      <Header title="LOBBY" />
      <View className="px-6 pt-2">
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[10px] uppercase tracking-[0.35em] text-runtable-faint">
          ROOM SEAT
        </Text>
        <Text
          style={{ fontFamily: 'IBMPlexMono_600SemiBold' }}
          className="mt-2 text-[22px] uppercase tracking-[0.4em] text-runtable-text">
          {code}
        </Text>
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-2 text-[12px] uppercase tracking-widest text-runtable-muted">
          {routeName || 'UNNAMED RUN'}
        </Text>
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-2 text-[10px] text-runtable-faint">
          FREE CAP {FREE_TIER_MAX_PARTICIPANTS} · MOCK JOINS ACTIVE
        </Text>
      </View>

      <View className="px-6 py-4">
        <CapacityBar filled={participants.length} capacity={Math.min(maxParticipants, 20)} />
      </View>

      <ThermalCard className="mx-6 mb-4 p-4">
        <View className="flex-row items-center gap-4">
          <View className="h-24 w-24 items-center justify-center border-2 border-dashed border-runtable-border bg-black">
            <QrCode color="#CFCFCF" size={36} strokeWidth={1.2} />
          </View>
          <View className="flex-1">
            <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[11px] uppercase tracking-widest text-runtable-text">
              JOIN ANCHOR
            </Text>
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-2 text-[10px] text-runtable-faint">
              MOCK DEEP LINK PLACEHOLDER
            </Text>
            <Pressable
              onPress={() => void Haptics.selectionAsync()}
              className="mt-4 flex-row items-center gap-2 self-start border border-runtable-border px-3 py-2 active:opacity-80">
              <Share2 color="#CFCFCF" size={16} strokeWidth={1.3} />
              <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[10px] uppercase text-runtable-muted">
                INVITE
              </Text>
            </Pressable>
          </View>
        </View>
      </ThermalCard>

      <View className="flex-row items-center justify-between px-6 pb-2">
        <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[10px] uppercase tracking-[0.28em] text-runtable-muted">
          PACK ROSTER
        </Text>
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[9px] text-runtable-faint">
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

      <View className="absolute bottom-0 left-0 right-0 gap-3 border-t border-runtable-border bg-runtable-bg px-6 pb-10 pt-4">
        <PixelButton
          variant="outline"
          label="TOGGLE MY READY"
          onPress={() => {
            const self = participants[0];
            if (self) toggleReady(self.id);
          }}
        />
        <PixelButton
          variant="solid"
          label="ARM COUNTDOWN"
          onPress={() => {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.push('/run/countdown');
          }}
        />
      </View>
    </View>
  );
}
