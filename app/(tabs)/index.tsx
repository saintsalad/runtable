import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Locate, Minus, Plus, ScanLine } from 'lucide-react-native';
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
import { NoiseOverlay } from '@/components/ui/NoiseOverlay';
import { Header } from '@/components/ui/Header';
import { DottedDivider } from '@/components/ui/DottedDivider';
import { PixelButton } from '@/components/ui/PixelButton';
import { TACTICAL_GRAY_MAP_STYLE } from '@/constants/mapStyles';
import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';
import { useDevSessionStore } from '@/store/devSessionStore';
import { useUpcomingRuns } from '@/hooks/useRunQueries';
import { colorForName, mockFullName } from '@/mocks/fixtures';
import { useRunTableStore } from '@/store';
import type { RunListing } from '@/types';

const INITIAL_REGION = {
  latitude: 14.5547,
  longitude: 121.0509,
  latitudeDelta: 0.38,
  longitudeDelta: 0.38,
};

function paceBracketLabel(listing: RunListing): string {
  const normalized = listing.paceMin.replace(/;/g, ':');
  const [ma, se] = normalized.split(':').map((x) => x.trim());
  const m = parseInt(ma ?? '5', 10);
  const sec = parseInt(se ?? '0', 10);
  return `${String(m).padStart(2, '0')}'${String(sec).padStart(2, '0')}"`;
}

function GlassButton({
  icon,
  onPress,
  label,
  mode,
}: {
  icon: React.ReactNode;
  onPress: () => void;
  label: string;
  mode: 'dark' | 'light';
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}>
      <BlurView
        intensity={60}
        tint={mode === 'dark' ? 'dark' : 'light'}
        style={{
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          overflow: 'hidden',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor:
            mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)',
        }}>
        {icon}
      </BlurView>
    </Pressable>
  );
}

export default function MapTab() {
  const router = useRouter();
  const { data: runs, isLoading } = useUpcomingRuns();
  const authUser = useRunTableStore((s) => s.authUser);
  const mapDayPhase = useDevSessionStore((s) => s.mapDayPhase);
  const t = useThemeTokens();

  const mapRef = useRef<MapView>(null);
  const sheetRef = useRef<BottomSheetModal>(null);
  const [selectedRun, setSelectedRun] = useState<RunListing | null>(null);
  const [hasLocation, setHasLocation] = useState(false);

  const listings = useMemo(() => runs ?? [], [runs]);

  useEffect(() => {
    void Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status === 'granted') setHasLocation(true);
    });
  }, []);

  useEffect(() => {
    if (!listings.length || !mapRef.current) return;
    const coords = listings.map((r) => r.coordinate);
    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 160, right: 56, bottom: 140, left: 56 },
      animated: true,
    });
  }, [listings]);

  const goLobby = useCallback(
    (r: RunListing) => {
      useRunTableStore.getState().setLobbyFromListing(r, {
        id: authUser.id,
        name: authUser.displayName,
        avatarColor: colorForName(authUser.displayName),
        paceZone: r.paceZone,
        isHost: false,
        isReady: true,
      });
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

  const zoomIn = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const cam = await mapRef.current?.getCamera();
    if (!cam) return;
    const next =
      cam.altitude != null
        ? { ...cam, altitude: cam.altitude * 0.5 }
        : { ...cam, zoom: (cam.zoom ?? 14) + 1 };
    mapRef.current?.animateCamera(next, { duration: 260 });
  }, []);

  const zoomOut = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const cam = await mapRef.current?.getCamera();
    if (!cam) return;
    const next =
      cam.altitude != null
        ? { ...cam, altitude: cam.altitude * 2 }
        : { ...cam, zoom: (cam.zoom ?? 14) - 1 };
    mapRef.current?.animateCamera(next, { duration: 260 });
  }, []);

  const fitAll = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!listings.length || !mapRef.current) return;
    mapRef.current.fitToCoordinates(listings.map((r) => r.coordinate), {
      edgePadding: { top: 160, right: 56, bottom: 140, left: 56 },
      animated: true,
    });
  }, [listings]);

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
    mapDayPhase === 'morning' ? 'rgba(246,241,231,0.22)' : 'rgba(0,0,0,0.14)';

  const iconColor = t.mode === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)';

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={INITIAL_REGION}
        customMapStyle={TACTICAL_GRAY_MAP_STYLE}
        mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
        showsUserLocation={hasLocation}
        zoomEnabled
        zoomTapEnabled
        zoomControlEnabled
        scrollEnabled
        pitchEnabled={false}
        rotateEnabled
        showsCompass={false}
        showsPointsOfInterest={false}
        showsBuildings={false}>
        {listings.map((r) => {
          const hostColor = colorForName(r.host.name);
          return (
            <Marker
              key={r.id}
              coordinate={r.coordinate}
              tracksViewChanges={false}
              onPress={() => openPreview(r)}>
              <RunTableMapPin
                paceBracket={paceBracketLabel(r)}
                routeLabel={r.routeName}
                hostName={r.host.name}
                hostColor={hostColor}
                selected={selectedRun?.id === r.id}
              />
            </Marker>
          );
        })}
      </MapView>

      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: atmosphereOverlay }]} />
      <NoiseOverlay opacity={0.03} />

      {/* Header */}
      <View pointerEvents="box-none" style={[StyleSheet.absoluteFill]}>
        <View pointerEvents="box-none">
          <Header hideBack title="RUNTABLE · MAP" />
          <View
            pointerEvents="none"
            style={{
              marginHorizontal: 16,
              marginTop: 4,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: t.border,
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor:
                t.mode === 'dark' ? 'rgba(12,12,14,0.7)' : 'rgba(255,255,255,0.75)',
            }}>
            <Text
              style={{
                fontFamily: 'PressStart2P_400Regular',
                color: t.muted,
                fontSize: 8,
                textTransform: 'uppercase',
                letterSpacing: 4,
              }}>
              TACTICAL VIEW
            </Text>
            <Text
              style={{
                fontFamily: 'IBMPlexMono_400Regular',
                color: t.faint,
                fontSize: 10,
                marginTop: 2,
              }}>
              {isLoading ? 'LOADING RUNTABLES…' : `${listings.length} PINS · METRO MANILA`}
            </Text>
          </View>
        </View>
      </View>

      {/* Glass map utility controls */}
      <View style={{ position: 'absolute', bottom: 100, left: 16, zIndex: 10, gap: 6 }}>
        <GlassButton
          icon={<Plus color={iconColor} size={16} strokeWidth={1.8} />}
          onPress={zoomIn}
          label="zoom in"
          mode={t.mode}
        />
        <GlassButton
          icon={<Minus color={iconColor} size={16} strokeWidth={1.8} />}
          onPress={zoomOut}
          label="zoom out"
          mode={t.mode}
        />
        <GlassButton
          icon={<ScanLine color={iconColor} size={16} strokeWidth={1.8} />}
          onPress={fitAll}
          label="fit all"
          mode={t.mode}
        />
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
              <Text
                style={{
                  fontFamily: 'IBMPlexMono_400Regular',
                  color: t.faint,
                  fontSize: 9,
                  textTransform: 'uppercase',
                  letterSpacing: 5,
                }}>
                RUNTABLE PREVIEW
              </Text>
              <Text
                style={{
                  fontFamily: 'PressStart2P_400Regular',
                  color: t.text,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  lineHeight: 18,
                  marginTop: 12,
                }}>
                {selectedRun.routeName.toUpperCase()}
              </Text>
              <Text
                style={{
                  fontFamily: 'IBMPlexMono_600SemiBold',
                  color: t.muted,
                  fontSize: 12,
                  marginTop: 8,
                }}>
                {paceBracketLabel(selectedRun)} · {selectedRun.distanceKm.toFixed(1)} KM
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <View style={{ borderWidth: 1, borderColor: t.border, paddingHorizontal: 8, paddingVertical: 4 }}>
                  <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.muted, fontSize: 8, textTransform: 'uppercase' }}>
                    HOST · {selectedRun.host.name.toUpperCase()}
                  </Text>
                </View>
                <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, fontSize: 10 }}>
                  {selectedRun.filled}/{selectedRun.capacity} SEATED
                </Text>
              </View>
              <DottedDivider className="my-4" />
              <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, fontSize: 9, textTransform: 'uppercase' }}>
                PACK
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                {previewParticipants.map((p) => (
                  <View
                    key={p.name}
                    style={{
                      width: 40,
                      height: 40,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: t.border,
                      backgroundColor: p.color,
                    }}>
                    <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', fontSize: 10, color: '#fff' }}>
                      {p.name.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
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
