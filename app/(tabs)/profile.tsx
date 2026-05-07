import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/GlassCard';
import { ReceiptCard } from '@/components/ReceiptCard';
import { useRunTableStore } from '@/store';

export default function ProfileScreen() {
  const router = useRouter();
  const authUser = useRunTableStore((s) => s.authUser);
  const receipts = useRunTableStore((s) => s.receipts);

  const heights = [200, 230, 210, 250, 190];

  const openReceipt = useCallback(
    (id: string) => {
      router.push({ pathname: '/run/receipt', params: { id } });
    },
    [router]
  );

  return (
    <SafeAreaView className="flex-1 bg-runtable-bg" edges={['top']}>
      <View className="px-6 pb-6 pt-4">
        <Text className="text-3xl font-bold text-white">{authUser.displayName}</Text>
        <Text className="mt-1 text-runtable-muted">Runner LVL {authUser.level}</Text>
        <View className="mt-6 flex-row gap-3">
          <GlassCard className="flex-1 p-4">
            <Text className="text-xs text-runtable-muted">Total runs</Text>
            <Text className="mt-2 text-2xl font-bold text-white">{authUser.totalRuns}</Text>
          </GlassCard>
          <GlassCard className="flex-1 p-4">
            <Text className="text-xs text-runtable-muted">Streak</Text>
            <Text className="mt-2 text-2xl font-bold text-runtable-accent">{authUser.streak}w</Text>
          </GlassCard>
        </View>
        <GlassCard className="mt-4 p-4">
          <Text className="text-xs text-runtable-muted">Pace profile</Text>
          <Text className="mt-2 text-lg font-semibold text-white">{authUser.paceProfile}</Text>
        </GlassCard>
      </View>

      <Text className="px-6 pb-3 text-lg font-semibold text-white">Saved receipts</Text>
      {receipts.length === 0 ? (
        <Text className="px-6 text-runtable-muted">No receipts yet — finish a run to start your wall.</Text>
      ) : (
        <View className="flex-row flex-wrap px-4 pb-12">
          {receipts.map((r, i) => (
            <View key={r.id} className="w-1/2 px-2 pb-4" style={{ width: '50%' }}>
              <ReceiptCard
                receipt={r}
                height={heights[i % heights.length]!}
                onPress={() => openReceipt(r.id)}
              />
            </View>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}
