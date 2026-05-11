import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Share2, QrCode, Copy, Check, MapPin, Navigation, Clock } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

import { CapacityBar } from '@/components/CapacityBar';
import { LobbyList } from '@/components/run/LobbyList';
import { LobbyChat } from '@/components/run/LobbyChat';
import { LobbyAnnouncements } from '@/components/run/LobbyAnnouncements';
import { LobbyTabBar, type LobbyTab } from '@/components/run/LobbyTabBar';
import { ParticipantAvatar } from '@/components/ParticipantAvatar';
import { RoutePreview } from '@/components/RoutePreview';
import { AnimatedCountdown } from '@/components/AnimatedCountdown';
import { PixelButton } from '@/components/ui/PixelButton';
import { Header } from '@/components/ui/Header';
import { DottedDivider } from '@/components/ui/DottedDivider';
import { ThermalCard } from '@/components/ui/ThermalCard';
import { NoiseOverlay } from '@/components/ui/NoiseOverlay';
import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';
import { FREE_TIER_MAX_PARTICIPANTS } from '@/constants/runtable';
import { useLobbyRealtime } from '@/hooks/useMockRealtime';
import { useSessionPermissions } from '@/hooks/useSessionPermissions';
import { useThemedTw } from '@/hooks/useThemedTw';
import { useRunTableStore } from '@/store';
import { colorForName } from '@/mocks/fixtures';
import type { ArrivalStatus } from '@/types';

const MOCK_INVITE_LINK = 'runtable.app/join/RT-0000';

const ARRIVAL_OPTIONS: ArrivalStatus[] = ['READY', 'ON THE WAY', 'RUNNING LATE'];
const ARRIVAL_COLOR: Record<ArrivalStatus, string> = {
  READY: '#4ade80',
  'ON THE WAY': '#facc15',
  'RUNNING LATE': '#f97316',
};
const ARRIVAL_ICON: Record<ArrivalStatus, typeof MapPin> = {
  READY: MapPin,
  'ON THE WAY': Navigation,
  'RUNNING LATE': Clock,
};

function roomCode(runId: string | null): string {
  const d = runId?.replace(/\D/g, '').slice(-4) ?? '0000';
  return `RT-${d.padStart(4, '0')}`;
}

function mockArrivalFor(participantId: string, seed: number): ArrivalStatus {
  const v = (seed + participantId.charCodeAt(participantId.length - 1)) % 3;
  return ARRIVAL_OPTIONS[v] ?? 'READY';
}

function useCountdownTimer(targetMs: number) {
  const [remaining, setRemaining] = useState(targetMs);
  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const m = Math.floor(remaining / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function LobbyScreen() {
  const router = useRouter();
  const participants = useRunTableStore((s) => s.participants);
  const maxParticipants = useRunTableStore((s) => s.maxParticipants);
  const routeName = useRunTableStore((s) => s.currentRouteName);
  const hostId = useRunTableStore((s) => s.lobbyHostId);
  const currentRunId = useRunTableStore((s) => s.currentRunId);
  const currentPolylineId = useRunTableStore((s) => s.currentPolylineId);
  const ambientWeather = useRunTableStore((s) => s.ambientWeather);
  const hostCancelWaitingSession = useRunTableStore((s) => s.hostCancelWaitingSession);
  const lockRoster = useRunTableStore((s) => s.lockRoster);
  const sessionPhase = useRunTableStore((s) => s.sessionPhase);
  const startActiveRun = useRunTableStore((s) => s.startActiveRun);
  const authUser = useRunTableStore((s) => s.authUser);
  const draftRun = useRunTableStore((s) => s.draftRun);
  const currentDistanceKm = useRunTableStore((s) => s.currentDistanceKm);
  const { canCancelWaitingSession, canLockRoster, isEffectiveHost } = useSessionPermissions();

  useLobbyRealtime(
    (sessionPhase === 'WAITING' || sessionPhase === 'LOCKED') && participants.length > 0,
    hostId
  );

  const isLocked = sessionPhase === 'LOCKED';
  const latestId = participants[participants.length - 1]?.id ?? null;
  const code = useMemo(() => roomCode(currentRunId), [currentRunId]);
  const hostParticipant = useMemo(() => participants.find((p) => p.id === hostId), [participants, hostId]);
  const hostName = hostParticipant?.name ?? authUser.displayName;

  const t = useThemeTokens();
  const tw = useThemedTw();

  const [activeTab, setActiveTab] = useState<LobbyTab>('CHAT');
  const [myArrival, setMyArrival] = useState<ArrivalStatus>('READY');
  const [launching, setLaunching] = useState(false);
  const seedRef = useRef(Date.now() % 100);

  // Auto-switch to SESSION tab when roster locks
  useEffect(() => {
    if (isLocked) setActiveTab('SESSION');
  }, [isLocked]);

  const paceLabel = useMemo(() => {
    if (!draftRun) return "05'50\"";
    return draftRun.paceZone === 'easy' ? "06'30\""
      : draftRun.paceZone === 'moderate' ? "05'42\""
      : draftRun.paceZone === 'tempo' ? "05'10\""
      : "04'35\"";
  }, [draftRun]);

  const onCountdownComplete = useCallback(() => {
    const { participants: parts, authUser: au } = useRunTableStore.getState();
    startActiveRun({
      paceLabel,
      participants: parts.length
        ? parts
        : [{ id: au.id, name: au.displayName, avatarColor: colorForName(au.displayName), paceZone: 'moderate', isHost: true, isReady: true }],
      distanceKm: currentDistanceKm,
    });
    router.replace('/run/live');
  }, [router, paceLabel, currentDistanceKm, startActiveRun]);

  const handleStartSession = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLaunching(true);
  }, []);

  const handleLockRoster = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    lockRoster();
  }, [lockRoster]);

  // Invite sheet
  const sheetRef = useRef<BottomSheetModal>(null);
  const [copied, setCopied] = useState(false);

  const openInvite = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sheetRef.current?.present();
  }, []);

  const copyLink = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const renderBackdrop = useCallback(
    (props: ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
    ),
    []
  );

  const readyCount = participants.filter((p) => p.isReady).length;
  const countdownLabel = useCountdownTimer(58 * 60 * 1000);

  if (launching) {
    return (
      <View style={{ flex: 1, backgroundColor: t.background }}>
        <NoiseOverlay opacity={0.08} />
        <AnimatedCountdown onComplete={onCountdownComplete} />
      </View>
    );
  }

  return (
    <View className={`flex-1 ${tw.bg}`}>
      <Header
        title={isLocked ? 'SESSION LOCKED' : 'LOBBY'}
        right={
          !isLocked ? (
            <Pressable onPress={openInvite} hitSlop={12} className="active:opacity-60">
              <Share2 color={t.muted} size={18} strokeWidth={1.4} />
            </Pressable>
          ) : undefined
        }
      />

      {/* Room info strip */}
      <View className="px-6 pt-3 pb-2">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text
              style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.text, fontSize: 22, letterSpacing: 4, textTransform: 'uppercase' }}>
              {routeName || 'UNNAMED RUN'}
            </Text>
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.muted, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>
              AVG PACE · {paceLabel}
            </Text>
          </View>
          <View className="items-end">
            <View style={{ borderWidth: 1, borderColor: isLocked ? '#4ade8055' : t.border, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 3, backgroundColor: isLocked ? 'rgba(74,222,128,0.08)' : 'transparent' }}>
              <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: isLocked ? '#4ade80' : t.faint, fontSize: 8, letterSpacing: 2, textTransform: 'uppercase' }}>
                {sessionPhase}
              </Text>
            </View>
            {draftRun?.startLabel ? (
              <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, fontSize: 9, marginTop: 4 }}>
                {draftRun.startLabel}
              </Text>
            ) : null}
          </View>
        </View>

      </View>

      {/* Capacity bar — hide when locked */}
      {!isLocked ? (
        <View className="px-6 pb-3">
          <CapacityBar filled={participants.length} capacity={Math.min(maxParticipants, FREE_TIER_MAX_PARTICIPANTS)} />
        </View>
      ) : null}

      {/* Tab bar */}
      <LobbyTabBar active={activeTab} onChange={setActiveTab} showSessionTab={isLocked} />

      {/* Tab content */}
      <View className="flex-1">
        {activeTab === 'MEMBERS' ? (
          <LobbyList
            participants={participants}
            latestParticipantId={latestId}
          />
        ) : activeTab === 'CHAT' ? (
          <LobbyChat hostName={hostName} displayName={authUser.displayName} />
        ) : activeTab === 'BOARD' ? (
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 12 }} showsVerticalScrollIndicator={false}>
            <View style={{ height: 220, borderRadius: 12, overflow: 'hidden' }}>
              <RoutePreview polylineId={currentPolylineId} variant="map" />
            </View>
            <LobbyAnnouncements isHost={isEffectiveHost} hostName={hostName} />
          </ScrollView>
        ) : activeTab === 'SESSION' ? (
          /* SESSION TAB — shown only when LOCKED */
          <ScrollView contentContainerStyle={{ paddingBottom: 140, paddingTop: 4 }} showsVerticalScrollIndicator={false}>
            {/* Countdown timer */}
            <Animated.View entering={FadeInDown.springify().damping(22)} className="px-6 pt-4 pb-2">
              <ThermalCard className="p-5">
                <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, fontSize: 9, letterSpacing: 3, textTransform: 'uppercase' }}>
                  RUN STARTS IN
                </Text>
                <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.text, fontSize: 48, letterSpacing: 4, marginTop: 4 }}>
                  {countdownLabel}
                </Text>
                <DottedDivider className="my-4" />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  {[
                    ['ROUTE', draftRun?.routeName ?? 'UNNAMED'],
                    ['DISTANCE', `${currentDistanceKm.toFixed(1)} KM`],
                    ['PACE', paceLabel],
                    ['WEATHER', ambientWeather],
                  ].map(([label, val]) => (
                    <View key={label}>
                      <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, fontSize: 8, textTransform: 'uppercase', letterSpacing: 1.5 }}>{label}</Text>
                      <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.muted, fontSize: 9, marginTop: 2 }}>{val}</Text>
                    </View>
                  ))}
                </View>
              </ThermalCard>
            </Animated.View>

            {/* My arrival status */}
            <View className="px-6 pt-4 pb-1">
              <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.muted, fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>
                MY STATUS
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {ARRIVAL_OPTIONS.map((status) => {
                  const active = myArrival === status;
                  const color = ARRIVAL_COLOR[status];
                  const Icon = ARRIVAL_ICON[status];
                  return (
                    <Pressable
                      key={status}
                      onPress={() => {
                        void Haptics.selectionAsync();
                        setMyArrival(status);
                      }}
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        gap: 6,
                        paddingVertical: 10,
                        borderWidth: 1,
                        borderColor: active ? color : t.border,
                        backgroundColor: active ? `${color}12` : t.card,
                        borderRadius: 6,
                      }}
                      className="active:opacity-70">
                      <Icon color={active ? color : t.faint} size={14} strokeWidth={1.6} />
                      <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: active ? color : t.faint, fontSize: 7, textTransform: 'uppercase', letterSpacing: 1.2, textAlign: 'center' }}>
                        {status}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Pack arrival grid */}
            <View className="px-6 pt-5 pb-2">
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.muted, fontSize: 9, letterSpacing: 3, textTransform: 'uppercase' }}>
                  PACK ARRIVAL
                </Text>
                <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, fontSize: 9 }}>
                  {participants.length} LOCKED
                </Text>
              </View>

              {participants.map((p) => {
                const arrival: ArrivalStatus =
                  p.id === authUser.id ? myArrival : mockArrivalFor(p.id, seedRef.current);
                const color = ARRIVAL_COLOR[arrival];
                const Icon = ARRIVAL_ICON[arrival];
                return (
                  <Animated.View
                    key={p.id}
                    entering={FadeInDown.springify().damping(24)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      borderWidth: 1,
                      borderColor: t.border,
                      backgroundColor: t.card,
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 8,
                    }}>
                    <ParticipantAvatar name={p.name} color={p.avatarColor} size="sm" isHost={p.isHost} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.text, fontSize: 11, textTransform: 'uppercase' }}>
                        {p.name}
                      </Text>
                      <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, fontSize: 9, marginTop: 2 }}>
                        {p.paceZone.toUpperCase()} · {p.isReady ? 'STAGED' : 'PENDING'}
                      </Text>
                    </View>
                    <View style={{ backgroundColor: `${color}18`, borderWidth: 1, borderColor: color, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 3, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Icon color={color} size={9} strokeWidth={1.8} />
                      <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color, fontSize: 7, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {arrival}
                      </Text>
                    </View>
                  </Animated.View>
                );
              })}

              {participants.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                  <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, fontSize: 10, textTransform: 'uppercase', letterSpacing: 2 }}>
                    NO PARTICIPANTS
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Pre-run note */}
            <View className="px-6 pt-2 pb-4">
              <ThermalCard className="p-4">
                <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 }}>
                  PRE-RUN NOTE
                </Text>
                <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.muted, fontSize: 11, lineHeight: 18 }}>
                  Warm up while you wait. Regroup is automatic at KM 2.5 water stop. Host will signal start when the pack is assembled.
                </Text>
              </ThermalCard>
            </View>
          </ScrollView>
        ) : null}
      </View>

      {/* Bottom actions — only render when there's something to show */}
      {(canCancelWaitingSession || (sessionPhase === 'WAITING' && isEffectiveHost) || sessionPhase === 'LOCKED') ? (
        <View
          style={{ borderTopWidth: 1, borderTopColor: t.border, backgroundColor: t.background, gap: 12, paddingHorizontal: 24, paddingBottom: 24, paddingTop: 14 }}>
          {canCancelWaitingSession ? (
            <PixelButton
              variant="outline"
              label="CANCEL SESSION"
              onPress={() => {
                void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                hostCancelWaitingSession();
                router.replace('/');
              }}
            />
          ) : null}

          {sessionPhase === 'WAITING' && isEffectiveHost ? (
            <PixelButton
              variant="solid"
              label={canLockRoster ? 'LOCK IN ROSTER →' : `LOCK IN · ${readyCount}/${participants.length} READY`}
              disabled={!canLockRoster}
              onPress={handleLockRoster}
            />
          ) : null}

          {sessionPhase === 'LOCKED' ? (
            isEffectiveHost ? (
              <PixelButton
                variant="solid"
                label="START SESSION →"
                onPress={handleStartSession}
              />
            ) : (
              <View style={{ borderWidth: 1, borderColor: '#4ade8055', borderStyle: 'dashed', paddingVertical: 14, alignItems: 'center', borderRadius: 4, backgroundColor: 'rgba(74,222,128,0.04)' }}>
                <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: '#4ade8099', fontSize: 10, textTransform: 'uppercase', letterSpacing: 3 }}>
                  WAITING FOR HOST TO START
                </Text>
              </View>
            )
          ) : null}
        </View>
      ) : null}

      {/* Invite bottom sheet */}
      <BottomSheetModal
        ref={sheetRef}
        enableDynamicSizing
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: t.backgroundElevated }}
        handleIndicatorStyle={{ backgroundColor: t.border }}>
        <BottomSheetView style={{ paddingHorizontal: 24, paddingBottom: 48, paddingTop: 8 }}>
          <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.text, fontSize: 11, letterSpacing: 5, textTransform: 'uppercase' }}>
            INVITE TO LOBBY
          </Text>

          <View
            style={{ width: 160, height: 160, borderColor: t.border, borderStyle: 'dashed', borderWidth: 2, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
            <QrCode color={t.muted} size={64} strokeWidth={1.2} />
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, marginTop: 8, fontSize: 9, letterSpacing: 3, textTransform: 'uppercase' }}>
              {code}
            </Text>
          </View>

          <DottedDivider className="my-5" />

          <View style={{ borderColor: t.border, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, gap: 12 }}>
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.muted, fontSize: 11, flex: 1 }} numberOfLines={1}>
              {MOCK_INVITE_LINK}
            </Text>
            <Pressable onPress={copyLink} hitSlop={8} className="active:opacity-60">
              {copied
                ? <Check color={t.text} size={16} strokeWidth={1.5} />
                : <Copy color={t.muted} size={16} strokeWidth={1.5} />}
            </Pressable>
          </View>
          {copied ? (
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, marginTop: 6, fontSize: 9, letterSpacing: 3, textTransform: 'uppercase' }}>
              COPIED
            </Text>
          ) : null}
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}
