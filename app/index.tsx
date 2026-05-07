import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { User } from 'lucide-react-native';
import type { ComponentProps } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

import { RunTableMapPin } from '@/components/home/RunTableMapPin';
import { FloatingCTA } from '@/components/FloatingCTA';
import { NoiseOverlay } from '@/components/ui/NoiseOverlay';
import { Header } from '@/components/ui/Header';
import { DottedDivider } from '@/components/ui/DottedDivider';
import { PixelButton } from '@/components/ui/PixelButton';
import { TACTICAL_GRAY_MAP_STYLE } from '@/constants/mapStyles';
import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';
import { coordinateForRunListingId } from '@/lib/listingMapCoordinate';
import { useDevSessionStore } from '@/store/devSessionStore';
import { useUpcomingRuns } from '@/hooks/useRunQueries';
import { colorForName, mockFullName } from '@/mocks/fixtures';
import { useRunTableStore } from '@/store';
import type { RunListing } from '@/types';

const INITIAL_REGION = {
  latitude: 14.5547,
  longitude: 121.0244,
  latitudeDelta: 0.07,
  longitudeDelta: 0.07,
};

function paceBracketLabel(listing: RunListing): string {
  const normalized = listing.paceMin.replace(/;/g, ':');
  const [ma, se] = normalized.split(':').map((x) => x.trim());
  const m = parseInt(ma ?? '5', 10);
  const sec = parseInt(se ?? '0', 10);
  return `${String(m).padStart(2, '0')}'${String(sec).padStart(2, '0')}"`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { data: runs, isLoading } = useUpcomingRuns();
  const authUser = useRunTableStore((s) => s.authUser);
  const mapDayPhase = useDevSessionStore((s) => s.mapDayPhase);
  const t = useThemeTokens();

  const mapRef = useRef<MapView>(null);
  const sheetRef = useRef<BottomSheetModal>(null);
  const [selectedRun, setSelectedRun] = useState<RunListing | null>(null);

  const listings = useMemo(() => runs ?? [], [runs]);

  useEffect(() => {
    if (!listings.length || !mapRef.current) return;
    const coords = listings.map((r) => coordinateForRunListingId(r.id));
    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 140, right: 48, bottom: 220, left: 48 },
      animated: true,
    });
  }, [listings]);

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

  const openPreview = useCallback((r: RunListing) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRun(r);
    sheetRef.current?.present();
  }, []);

  const closeSheet = useCallback(() => {
    sheetRef.current?.dismiss();
    setSelectedRun(null);
  }, []);

  const renderBackdrop = useCallback(
    (props: ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
    ),
    []
  );

  const previewParticipants = useMemo(() => {
    if (!selectedRun) return [];
    const seed = selectedRun.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return [0, 1, 2, 3].map((i) => ({
      name: mockFullName(seed + i * 17),
      color: colorForName(`${seed}-${i}`),
    }));
  }, [selectedRun]);

  const atmosphereOverlay =
    mapDayPhase === 'morning'
      ? 'rgba(246,241,231,0.22)'
      : 'rgba(0,0,0,0.14)';

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={INITIAL_REGION}
        customMapStyle={TACTICAL_GRAY_MAP_STYLE}
        mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
        rotateEnabled
        pitchEnabled={false}
        showsCompass={false}
        showsPointsOfInterest={false}
        showsBuildings={false}>
        {listings.map((r) => {
          const coord = coordinateForRunListingId(r.id);
          return (
            <Marker key={r.id} coordinate={coord} tracksViewChanges={false} onPress={() => openPreview(r)}>
              <RunTableMapPin
                paceBracket={paceBracketLabel(r)}
                routeLabel={r.routeName}
                selected={selectedRun?.id === r.id}
              />
            </Marker>
          );
        })}
      </MapView>

      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: atmosphereOverlay }]} />

      <NoiseOverlay opacity={0.03} />

      <View pointerEvents="box-none" className="absolute inset-x-0 top-0 z-10">
        <Header
          hideBack
          title="RUNTABLE · MAP"
          right={
            <Pressable
              onPress={() => router.push('/profile')}
              hitSlop={12}
              className="border px-2 py-1.5 active:opacity-80"
              style={{ borderColor: t.border }}>
              <User color={t.muted} size={18} strokeWidth={1.4} />
            </Pressable>
          }
        />
        <View className="mx-4 mt-1 border px-3 py-2" style={{ borderColor: t.border, backgroundColor: t.card }}>
          <Text style={{ fontFamily: 'PressStart2P_400Regular', color: t.muted }} className="text-[8px] uppercase tracking-widest">
            TACTICAL VIEW
          </Text>
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint }} className="text-[10px]">
            {isLoading ? 'LOADING RUNTABLES…' : `${listings.length} PINS · MOCK`}
          </Text>
        </View>
      </View>

      <View
        pointerEvents="box-none"
        className="absolute bottom-0 left-0 right-0 z-10 border-t px-4 pb-8 pt-3"
        style={{ borderTopColor: t.border, backgroundColor: t.background }}>
        <FloatingCTA label="CONFIG NEW RUN" onPress={() => router.push('/run/create')} />
      </View>

      <BottomSheetModal
        ref={sheetRef}
        index={0}
        snapPoints={['42%']}
        enablePanDownToClose
        onDismiss={() => setSelectedRun(null)}
        backgroundStyle={{ backgroundColor: t.card }}
        handleIndicatorStyle={{ backgroundColor: t.muted }}
        backdropComponent={renderBackdrop}>
        <BottomSheetView style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 24 }}>
          {selectedRun ? (
            <>
              <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint }} className="text-[9px] uppercase tracking-[0.3em]">
                RUNTABLE PREVIEW
              </Text>
              <Text style={{ fontFamily: 'PressStart2P_400Regular', color: t.text }} className="mt-3 text-[11px] uppercase leading-relaxed">
                {selectedRun.routeName.toUpperCase()}
              </Text>
              <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.muted }} className="mt-2 text-[12px]">
                {paceBracketLabel(selectedRun)} · {selectedRun.distanceKm.toFixed(1)} KM
              </Text>
              <View className="mt-2 flex-row flex-wrap items-center gap-2">
                <View
                  className="border px-2 py-1"
                  style={{ borderColor: t.border }}>
                  <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.muted }} className="text-[8px] uppercase tracking-tighter">
                    HOST · {selectedRun.host.name.toUpperCase()}
                  </Text>
                </View>
                <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint }} className="text-[10px]">
                  {selectedRun.filled}/{selectedRun.capacity} SEATED
                </Text>
              </View>
              <DottedDivider className="my-4" />
              <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint }} className="text-[9px] uppercase">
                PACK
              </Text>
              <View className="mt-3 flex-row gap-2">
                {previewParticipants.map((p) => (
                  <View
                    key={p.name}
                    className="h-10 w-10 items-center justify-center border"
                    style={{ borderColor: t.border, backgroundColor: p.color }}>
                    <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[10px] text-white">
                      {p.name
                        .split(' ')
                        .map((x) => x[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </Text>
                  </View>
                ))}
              </View>
              <View className="mt-6 flex-row gap-3">
                <PixelButton variant="outline" className="flex-1" label="CLOSE" onPress={closeSheet} />
                <PixelButton
                  variant="solid"
                  className="flex-1"
                  label="JOIN"
                  onPress={() => {
                    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    closeSheet();
                    goLobby(selectedRun);
                  }}
                />
              </View>
            </>
          ) : null}
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}
