import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Activity, ExternalLink } from 'lucide-react-native';
import { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';

import { ReceiptCard } from '@/components/ReceiptCard';
import { NoiseOverlay } from '@/components/ui/NoiseOverlay';
import { Header } from '@/components/ui/Header';
import { DottedDivider } from '@/components/ui/DottedDivider';
import { ThermalCard } from '@/components/ui/ThermalCard';
import { PixelButton } from '@/components/ui/PixelButton';
import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';
import { useRunTableStore } from '@/store';

export default function ActivitiesTab() {
  const router = useRouter();
  const t = useThemeTokens();
  const receipts = useRunTableStore((s) => s.receipts);
  const authUser = useRunTableStore((s) => s.authUser);

  const heights = useMemo(() => [200, 230, 210, 250], []);

  const openReceipt = useCallback(
    (id: string) => {
      router.push({ pathname: '/run/receipt', params: { id } });
    },
    [router]
  );

  const renderReceipt = useCallback(
    ({ item, index }: { item: (typeof receipts)[0]; index: number }) => (
      <View style={{ width: '50%', paddingHorizontal: 8 }}>
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
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <NoiseOverlay opacity={0.035} />
      <Header hideBack title="ACTIVITIES" />

      <FlashList
        data={receipts}
        renderItem={renderReceipt}
        keyExtractor={(r) => r.id}
        numColumns={2}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 }}>
            {/* Stats row */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <ThermalCard elevated className="flex-1 p-4">
                <Text
                  style={{
                    fontFamily: 'IBMPlexMono_400Regular',
                    color: t.faint,
                    fontSize: 8,
                    textTransform: 'uppercase',
                    letterSpacing: 4,
                  }}>
                  TOTAL RUNS
                </Text>
                <Text
                  style={{
                    fontFamily: 'IBMPlexMono_600SemiBold',
                    color: t.text,
                    fontSize: 22,
                    marginTop: 8,
                  }}>
                  {authUser.totalRuns.toString().padStart(2, '0')}
                </Text>
              </ThermalCard>
              <ThermalCard elevated className="flex-1 p-4">
                <Text
                  style={{
                    fontFamily: 'IBMPlexMono_400Regular',
                    color: t.faint,
                    fontSize: 8,
                    textTransform: 'uppercase',
                    letterSpacing: 4,
                  }}>
                  STREAK
                </Text>
                <Text
                  style={{
                    fontFamily: 'IBMPlexMono_600SemiBold',
                    color: t.text,
                    fontSize: 22,
                    marginTop: 8,
                  }}>
                  {authUser.streak}W
                </Text>
              </ThermalCard>
            </View>

            {/* Import from Strava */}
            <ThermalCard className="mb-4 p-4">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <ExternalLink color={t.muted} size={15} strokeWidth={1.4} />
                <Text
                  style={{
                    fontFamily: 'IBMPlexMono_600SemiBold',
                    color: t.text,
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                  }}>
                  STRAVA ACTIVITIES
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: 'IBMPlexMono_400Regular',
                  color: t.faint,
                  fontSize: 10,
                  marginBottom: 12,
                }}>
                Import your Strava runs to print receipts and track your history.
              </Text>
              <PixelButton variant="outline" label="CONNECT STRAVA" onPress={() => {}} />
            </ThermalCard>

            <DottedDivider />
            <Text
              style={{
                fontFamily: 'IBMPlexMono_600SemiBold',
                color: t.muted,
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: 6,
                paddingTop: 16,
                paddingBottom: 4,
              }}>
              SAVED RECEIPTS
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingVertical: 24,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: t.border,
              }}>
              <Activity color={t.faint} size={18} strokeWidth={1.4} />
              <Text
                style={{
                  fontFamily: 'IBMPlexMono_400Regular',
                  color: t.faint,
                  fontSize: 11,
                }}>
                NO ARCHIVED SLIPS
              </Text>
            </View>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 48 }}
      />
    </View>
  );
}
