import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';

import { ReceiptCard } from '@/components/ReceiptCard';
import { NoiseOverlay } from '@/components/ui/NoiseOverlay';
import { ThermalCard } from '@/components/ui/ThermalCard';
import { Header } from '@/components/ui/Header';
import { DottedDivider } from '@/components/ui/DottedDivider';
import { useRunTableStore } from '@/store';

export default function ProfileScreen() {
  const router = useRouter();
  const authUser = useRunTableStore((s) => s.authUser);
  const receipts = useRunTableStore((s) => s.receipts);

  const heights = useMemo(() => [200, 230, 210, 250], []);

  const openReceipt = useCallback(
    (id: string) => {
      router.push({ pathname: '/run/receipt', params: { id } });
    },
    [router]
  );

  const renderReceipt = useCallback(
    ({ item, index }: { item: (typeof receipts)[0]; index: number }) => (
      <View className="w-1/2 px-2" style={{ width: '50%' }}>
        <ReceiptCard
          receipt={item}
          height={heights[index % heights.length]!}
          stackIndex={index % 4}
          onPress={() => openReceipt(item.id)}
        />
      </View>
    ),
    [heights, openReceipt]
  );

  return (
    <View className="flex-1 bg-runtable-bg">
      <NoiseOverlay opacity={0.035} />
      <Header title="ARCHIVE" onBackPress={() => router.replace('/')} />

      <View className="px-6 pb-4 pt-2">
        <Text
          style={{ fontFamily: 'PressStart2P_400Regular' }}
          className="text-[10px] uppercase leading-relaxed tracking-receipt text-runtable-muted">
          RUNNER LOCKER
        </Text>
        <Text
          style={{ fontFamily: 'IBMPlexMono_600SemiBold' }}
          className="mt-3 text-[16px] uppercase tracking-[0.25em] text-runtable-text">
          {authUser.displayName}
        </Text>
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-1 text-[11px] text-runtable-faint">
          LVL {authUser.level} · STORED SLIPS
        </Text>

        <View className="mt-6 flex-row gap-3">
          <ThermalCard elevated className="flex-1 p-4">
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[9px] uppercase tracking-[0.3em] text-runtable-faint">
              TOTAL RUNS
            </Text>
            <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="mt-2 text-[22px] text-runtable-text">
              {authUser.totalRuns.toString().padStart(2, '0')}
            </Text>
          </ThermalCard>
          <ThermalCard elevated className="flex-1 p-4">
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[9px] uppercase tracking-[0.3em] text-runtable-faint">
              STREAK
            </Text>
            <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="mt-2 text-[22px] text-runtable-text">
              {authUser.streak}W
            </Text>
          </ThermalCard>
        </View>

        <ThermalCard className="mt-4 p-4">
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[9px] uppercase tracking-[0.3em] text-runtable-faint">
            PACE IDENTITY
          </Text>
          <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="mt-3 text-[12px] uppercase tracking-widest text-runtable-muted">
            {authUser.paceProfile}
          </Text>
        </ThermalCard>
      </View>

      <View className="flex-1 px-6">
        <DottedDivider />
        <Text
          style={{ fontFamily: 'IBMPlexMono_600SemiBold' }}
          className="pb-4 pt-4 text-[11px] uppercase tracking-[0.35em] text-runtable-muted">
          SAVED RECEIPTS
        </Text>
        {receipts.length === 0 ? (
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="pb-16 text-[11px] text-runtable-faint">
            NO ARCHIVED SLIPS
          </Text>
        ) : (
          <FlashList
            data={receipts}
            renderItem={renderReceipt}
            keyExtractor={(r) => r.id}
            numColumns={2}
            contentContainerStyle={{ paddingBottom: 48 }}
          />
        )}
      </View>
    </View>
  );
}
