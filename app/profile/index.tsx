import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';

import { ReceiptCard } from '@/components/ReceiptCard';
import { NoiseOverlay } from '@/components/ui/NoiseOverlay';
import { ThermalCard } from '@/components/ui/ThermalCard';
import { Header } from '@/components/ui/Header';
import { DottedDivider } from '@/components/ui/DottedDivider';
import { PixelButton } from '@/components/ui/PixelButton';
import type { ThemePreference } from '@/constants/palettes';
import { useDevSessionStore } from '@/store/devSessionStore';
import { useThemeStore } from '@/store/themeStore';
import { useRunTableStore } from '@/store';
import type { DevMockRole, WeatherAtmosphere } from '@/types';

const MOCK_WEATHER: WeatherAtmosphere[] = ['DRIZZLE', 'HUMID', 'CLEAR NIGHT', 'WINDY'];

export default function ProfileScreen() {
  const router = useRouter();
  const authUser = useRunTableStore((s) => s.authUser);
  const receipts = useRunTableStore((s) => s.receipts);
  const devMockRole = useDevSessionStore((s) => s.devMockRole);
  const setDevMockRole = useDevSessionStore((s) => s.setDevMockRole);
  const mapDayPhase = useDevSessionStore((s) => s.mapDayPhase);
  const setMapDayPhase = useDevSessionStore((s) => s.setMapDayPhase);
  const themePreference = useThemeStore((s) => s.preference);
  const setThemePreference = useThemeStore((s) => s.setPreference);
  const ambientWeather = useRunTableStore((s) => s.ambientWeather);
  const setAmbientWeather = useRunTableStore((s) => s.setAmbientWeather);

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

        <ThermalCard className="mt-4 p-4">
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[9px] uppercase tracking-[0.3em] text-runtable-faint">
            THERMAL PORTRAIT
          </Text>
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-2 text-[10px] text-runtable-faint">
            Bitmap / dither lab — receipts & roster stamps.
          </Text>
          <PixelButton
            variant="outline"
            className="mt-4"
            label="OPEN BITMAP LAB"
            onPress={() => router.push('/profile/bitmap-avatar')}
          />
        </ThermalCard>

        <ThermalCard className="mt-4 p-4">
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-2 text-[10px] text-runtable-faint">
            MOCK ROLE (HOST / JOINER / AUTO)
          </Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {(['auto', 'host', 'joiner'] as const satisfies readonly DevMockRole[]).map((r) => (
              <PixelButton
                key={r}
                variant={devMockRole === r ? 'solid' : 'outline'}
                label={r.toUpperCase()}
                className="min-w-[28%] flex-1 px-1"
                onPress={() => setDevMockRole(r)}
              />
            ))}
          </View>
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-4 text-[10px] text-runtable-faint">
            THEME PREFERENCE
          </Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {(['system', 'light', 'dark'] as const satisfies readonly ThemePreference[]).map((p) => (
              <PixelButton
                key={p}
                variant={themePreference === p ? 'solid' : 'outline'}
                label={p.toUpperCase()}
                className="min-w-[28%] flex-1 px-1"
                onPress={() => setThemePreference(p)}
              />
            ))}
          </View>
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-4 text-[10px] text-runtable-faint">
            MOCK WEATHER (LOBBY / RECEIPT)
          </Text>
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-1 text-[9px] text-runtable-muted">
            NOW · {ambientWeather}
          </Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {MOCK_WEATHER.map((w) => (
              <PixelButton
                key={w}
                variant={ambientWeather === w ? 'solid' : 'outline'}
                label={w.replace(' ', '\n')}
                className="min-w-[45%] flex-1 px-1"
                onPress={() => setAmbientWeather(w)}
              />
            ))}
          </View>
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-4 text-[10px] text-runtable-faint">
            MAP DAY PHASE (MOCK)
          </Text>
          <View className="mt-3 flex-row gap-2">
            <PixelButton
              variant={mapDayPhase === 'night' ? 'solid' : 'outline'}
              label="NIGHT"
              className="flex-1"
              onPress={() => setMapDayPhase('night')}
            />
            <PixelButton
              variant={mapDayPhase === 'morning' ? 'solid' : 'outline'}
              label="MORNING"
              className="flex-1"
              onPress={() => setMapDayPhase('morning')}
            />
          </View>
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
