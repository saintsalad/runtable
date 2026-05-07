import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { useCallback } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FloatingCTA } from '@/components/FloatingCTA';
import { GlassCard } from '@/components/GlassCard';
import { PaceBadge } from '@/components/PaceBadge';
import { ParticipantAvatar } from '@/components/ParticipantAvatar';
import { RunCard } from '@/components/RunCard';
import { FREE_TIER_MAX_PARTICIPANTS } from '@/constants/runtable';
import { colorForName } from '@/mocks/fixtures';
import {
  paceZoneLabel,
  useFriendsOnline,
  useUpcomingRuns,
} from '@/hooks/useRunQueries';
import { useRunTableStore } from '@/store';
import type { RunListing } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const { data: runs, isLoading } = useUpcomingRuns();
  const { data: friends } = useFriendsOnline();
  const authUser = useRunTableStore((s) => s.authUser);

  const renderRun = useCallback(({ item }: { item: RunListing }) => {
    return (
      <RunCard
        run={item}
        onPress={(r) => {
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
        }}
      />
    );
  }, [authUser.displayName, authUser.id, router]);

  return (
    <SafeAreaView className="flex-1 bg-runtable-bg" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        nestedScrollEnabled>
        <LinearGradient
          colors={['rgba(124,255,107,0.12)', 'transparent']}
          style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20 }}>
          <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-runtable-muted">
            RunTable
          </Text>
          <Text className="mt-2 text-3xl font-bold text-white">Pack up. Move together.</Text>
          <Text className="mt-2 text-base text-runtable-muted">
            Group runs matched by pace — live energy without the noise.
          </Text>
        </LinearGradient>

        <View className="px-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-white">Upcoming near you</Text>
            {isLoading ? <Text className="text-xs text-runtable-muted">Loading…</Text> : null}
          </View>
          <FlashList
            data={runs ?? []}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={renderRun}
          />

          <Text className="mb-3 mt-8 text-lg font-semibold text-white">Your pace zone</Text>
          <GlassCard className="p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-runtable-muted">Sweet spot</Text>
                <Text className="mt-1 text-xl font-bold text-white">{paceZoneLabel('moderate')}</Text>
              </View>
              <PaceBadge zone="moderate" />
            </View>
            <View className="mt-4 flex-row items-center gap-2">
              <Sparkles color="#7CFF6B" size={18} />
              <Text className="flex-1 text-sm text-runtable-muted">
                Today we&apos;re surfacing {FREE_TIER_MAX_PARTICIPANTS}-pack friendly crews. Upgrade
                later for bigger tables.
              </Text>
            </View>
          </GlassCard>

          <Text className="mb-3 mt-8 text-lg font-semibold text-white">Quick join</Text>
          <View className="flex-row flex-wrap gap-3">
            {(runs ?? []).slice(0, 4).map((r) => (
              <GlassCard key={r.id} className="min-w-[48%] flex-1 p-3">
                <Text className="text-sm font-semibold text-white" numberOfLines={2}>
                  {r.routeName}
                </Text>
                <Text className="mt-1 text-xs text-runtable-muted">
                  {r.distanceKm} km · {r.startTimeLabel}
                </Text>
              </GlassCard>
            ))}
          </View>

          <Text className="mb-3 mt-8 text-lg font-semibold text-white">Active friends</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-4 pr-6">
              {(friends ?? []).map((f) => (
                <View key={f.id} className="items-center gap-2">
                  <ParticipantAvatar
                    name={f.name}
                    color={f.avatarColor}
                    pulse={f.isActive}
                  />
                  <Text className="max-w-[72px] text-center text-xs text-runtable-muted" numberOfLines={2}>
                    {f.name}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-6 pb-6">
        <FloatingCTA
          label="Create Run"
          onPress={() => router.push('/run/create')}
        />
      </View>
    </SafeAreaView>
  );
}
