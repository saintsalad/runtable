import { useRouter } from 'expo-router';
import { User } from 'lucide-react-native';
import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { RunCard } from '@/components/RunCard';
import { FloatingCTA } from '@/components/FloatingCTA';
import { PaceBadge } from '@/components/PaceBadge';
import { ReceiptCard } from '@/components/ReceiptCard';
import { NoiseOverlay } from '@/components/ui/NoiseOverlay';
import { Header } from '@/components/ui/Header';
import { ThermalCard } from '@/components/ui/ThermalCard';
import { DottedDivider } from '@/components/ui/DottedDivider';
import { FREE_TIER_MAX_PARTICIPANTS } from '@/constants/runtable';
import { paceZoneLabel, useFriendsOnline, useUpcomingRuns } from '@/hooks/useRunQueries';
import { colorForName } from '@/mocks/fixtures';
import { useRunTableStore } from '@/store';
import type { RunListing } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const { data: runs, isLoading } = useUpcomingRuns();
  const { data: friends } = useFriendsOnline();
  const authUser = useRunTableStore((s) => s.authUser);
  const receipts = useRunTableStore((s) => s.receipts);

  const { active, nearby } = useMemo(() => {
    const list = runs ?? [];
    const a = list.filter((r) => r.filled > 0 && r.filled < r.capacity).slice(0, 6);
    const n = list.filter((r) => r.filled === 0 || r.filled >= r.capacity).slice(0, 8);
    return { active: a.length ? a : list.slice(0, 4), nearby: n.length ? n : list.slice(4, 10) };
  }, [runs]);

  const goLobby = useCallback(
    (r: RunListing) => {
      const hostSelf = {
        id: authUser.id,
        name: authUser.displayName,
        avatarColor: colorForName(authUser.displayName),
        paceZone: r.paceZone,
        isHost: false,
        isReady: true,
      };
      useRunTableStore.getState().setLobbyFromListing(r, hostSelf);
      router.push('/run/lobby');
    },
    [authUser.displayName, authUser.id, router]
  );

  return (
    <View className="flex-1 bg-runtable-bg">
      <NoiseOverlay opacity={0.04} />
      <Header
        hideBack
        title="RUNTABLE"
        right={
          <Pressable
            onPress={() => router.push('/profile')}
            hitSlop={12}
            className="border border-runtable-border px-2 py-1.5 active:opacity-80">
            <User color="#CFCFCF" size={18} strokeWidth={1.4} />
          </Pressable>
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 132 }}
        showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-4">
          <Text
            style={{ fontFamily: 'PressStart2P_400Regular' }}
            className="text-[10px] uppercase leading-relaxed tracking-receipt text-runtable-muted">
            SOCIAL PACK · LIVE COORDINATION
          </Text>
          <Text
            style={{ fontFamily: 'IBMPlexMono_600SemiBold' }}
            className="mt-4 text-[14px] uppercase tracking-[0.22em] text-runtable-text">
            ━━━ FEED ━━━
          </Text>
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-2 text-[12px] text-runtable-faint">
            {isLoading ? 'SPOOLING RUNS…' : 'THERMAL PREVIEW · MOCK DATA'}
          </Text>
        </View>

        <View className="mt-6 px-6">
          <SectionLabel text="ACTIVE RUNS" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3 pr-2">
              {active.map((item) => (
                <RunCard key={item.id} run={item} onPress={goLobby} layout="carousel" />
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="mt-8 px-6">
          <SectionLabel text="NEARBY TABLES" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3 pr-2">
              {nearby.map((item) => (
                <RunCard key={item.id} run={item} onPress={goLobby} layout="carousel" />
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="mt-10 px-6">
          <SectionLabel text="PACE IDENTITY" />
          <ThermalCard className="p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[10px] uppercase tracking-[0.3em] text-runtable-faint">
                  SWEET SPOT
                </Text>
                <Text
                  style={{ fontFamily: 'IBMPlexMono_600SemiBold' }}
                  className="mt-2 text-[13px] uppercase tracking-widest text-runtable-text">
                  {paceZoneLabel('moderate')}
                </Text>
              </View>
              <PaceBadge zone="moderate" />
            </View>
            <DottedDivider className="my-4" />
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[11px] uppercase tracking-wide text-runtable-muted">
              FREE SEATS CAP AT {FREE_TIER_MAX_PARTICIPANTS} · PRO UNLOCKS 20+
            </Text>
          </ThermalCard>
        </View>

        <View className="mt-10 px-6">
          <SectionLabel text="ONLINE PACK" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3 pr-6">
              {(friends ?? []).map((f) => (
                <ThermalCard key={f.id} elevated className="min-w-[88px] items-center px-3 py-3">
                  <View
                    className="h-10 w-10 items-center justify-center border border-runtable-border"
                    style={{ backgroundColor: f.avatarColor }}>
                    <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[10px] text-white">
                      {f.name
                        .split(' ')
                        .map((x) => x[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </Text>
                  </View>
                  <Text
                    style={{ fontFamily: 'IBMPlexMono_400Regular' }}
                    className="mt-2 max-w-[88px] text-center text-[9px] uppercase tracking-widest text-runtable-muted"
                    numberOfLines={2}>
                    {f.name}
                  </Text>
                  {f.isActive ? (
                    <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-1 text-[8px] text-runtable-faint">
                      LIVE
                    </Text>
                  ) : null}
                </ThermalCard>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="mt-10 px-6">
          <SectionLabel text="RECENT RECEIPTS" />
          {receipts.length === 0 ? (
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[11px] text-runtable-faint">
              NO SLIPS YET · FINISH A RUN
            </Text>
          ) : (
            <View className="flex-row flex-wrap justify-between gap-y-4">
              {receipts.slice(0, 4).map((r, i) => (
                <View key={r.id} className="w-[48%]">
                  <ReceiptCard
                    receipt={r}
                    height={220}
                    stackIndex={i}
                    onPress={() => router.push({ pathname: '/run/receipt', params: { id: r.id } })}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-runtable-border bg-runtable-bg px-6 pb-8 pt-4">
        <FloatingCTA label="CONFIG NEW RUN" onPress={() => router.push('/run/create')} />
      </View>
    </View>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <View className="mb-3">
      <Text
        style={{ fontFamily: 'IBMPlexMono_600SemiBold' }}
        className="text-[11px] uppercase tracking-[0.35em] text-runtable-muted">
        {text}
      </Text>
    </View>
  );
}
