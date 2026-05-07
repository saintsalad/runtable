import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { FileText } from 'lucide-react-native';
import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/GlassCard';
import { ReceiptCard } from '@/components/ReceiptCard';
import { useRunTableStore } from '@/store';

export default function ReceiptsTabScreen() {
  const router = useRouter();
  const receipts = useRunTableStore((s) => s.receipts);

  const openComposer = useCallback(() => {
    router.push('/run/create');
  }, [router]);

  const renderItem = useCallback(
    ({ item, index }: { item: (typeof receipts)[number]; index: number }) => {
      const heights = [190, 220, 200, 240];
      const h = heights[index % heights.length]!;
      return (
        <View className="px-6 pb-1">
          <ReceiptCard
            receipt={item}
            height={h}
            onPress={() => router.push({ pathname: '/run/receipt', params: { id: item.id } })}
          />
        </View>
      );
    },
    [router]
  );

  return (
    <SafeAreaView className="flex-1 bg-runtable-bg" edges={['top']}>
      <View className="flex-row items-start justify-between px-6 pb-4 pt-4">
        <View className="flex-1 pr-4">
          <Text className="text-3xl font-bold text-white">Receipts</Text>
          <Text className="mt-2 text-base text-runtable-muted">
            Collectible proof you showed up — crafted like a finish-line ticket.
          </Text>
        </View>
        <GlassCard className="p-3">
          <FileText color="#7CFF6B" size={22} />
        </GlassCard>
      </View>

      {receipts.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-runtable-muted">
            Finish a pack run to mint your first receipt. It&apos;ll land here automatically.
          </Text>
          <Pressable onPress={openComposer} className="mt-6 rounded-2xl bg-white/10 px-5 py-3">
            <Text className="font-semibold text-white">Start a table</Text>
          </Pressable>
        </View>
      ) : (
        <FlashList
          data={receipts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </SafeAreaView>
  );
}
