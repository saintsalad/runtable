import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RunCard } from '@/components/RunCard';
import { colorForName } from '@/mocks/fixtures';
import { useRunsFeed } from '@/hooks/useRunQueries';
import { useRunTableStore } from '@/store';
import type { RunListing } from '@/types';

export default function RunsScreen() {
  const router = useRouter();
  const { data, isLoading } = useRunsFeed();
  const authUser = useRunTableStore((s) => s.authUser);

  const renderItem = useCallback(
    ({ item }: { item: RunListing }) => (
      <View className="px-6 pb-4">
        <RunCard
          layout="feed"
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
      </View>
    ),
    [authUser.displayName, authUser.id, router]
  );

  return (
    <SafeAreaView className="flex-1 bg-runtable-bg" edges={['top']}>
      <View className="px-6 pb-4 pt-4">
        <Text className="text-3xl font-bold text-white">My runs</Text>
        <Text className="mt-2 text-base text-runtable-muted">
          Crews you&apos;re tracking — tap to drop into the lobby vibe.
        </Text>
      </View>
      {isLoading ? (
        <Text className="px-6 text-runtable-muted">Loading your agenda…</Text>
      ) : null}
      <FlashList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </SafeAreaView>
  );
}
