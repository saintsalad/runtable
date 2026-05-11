import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Pause, Play, StepBack } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { LeaderboardItem } from '@/components/LeaderboardItem';
import { HostSessionBar } from '@/components/run/HostSessionBar';
import { LiveActionBar } from '@/components/run/LiveActionBar';
import { PackTracker } from '@/components/run/PackTracker';
import { Header } from '@/components/ui/Header';
import { ThermalCard } from '@/components/ui/ThermalCard';
import { PixelButton } from '@/components/ui/PixelButton';
import { DottedDivider } from '@/components/ui/DottedDivider';
import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';
import { useLiveRealtime } from '@/hooks/useMockRealtime';
import { useSessionPermissions } from '@/hooks/useSessionPermissions';
import { useRunTableStore } from '@/store';
import type { Receipt } from '@/types';

const GLYPHS = ['◇', '◆', '▓', '▪'];

const REACTIONS = [
  { label: '!!!', glyph: '▮' },
  { label: 'FIRE', glyph: '△' },
  { label: 'WATER', glyph: '▽' },
  { label: 'CLAP', glyph: '◆' },
  { label: 'HEART', glyph: '♥' },
] as const;

export default function LiveRunScreen() {
  const router = useRouter();
  const participants = useRunTableStore((s) => s.participants);
  const distanceKm = useRunTableStore((s) => s.currentDistanceKm);
  const packPositions = useRunTableStore((s) => s.packPositions);
  const leaderboard = useRunTableStore((s) => s.leaderboard);
  const elapsedMs = useRunTableStore((s) => s.elapsedMs);
  const paused = useRunTableStore((s) => s.paused);
  const currentPaceLabel = useRunTableStore((s) => s.currentPaceLabel);
  const cheerEvents = useRunTableStore((s) => s.cheerEvents);
  const togglePause = useRunTableStore((s) => s.togglePause);
  const addCheer = useRunTableStore((s) => s.addCheer);
  const sessionPhase = useRunTableStore((s) => s.sessionPhase);
  const participantRuns = useRunTableStore((s) => s.participantRuns);
  const authUser = useRunTableStore((s) => s.authUser);
  const finishPersonalRun = useRunTableStore((s) => s.finishPersonalRun);
  const leaveSessionSelf = useRunTableStore((s) => s.leaveSessionSelf);
  const hostCloseSession = useRunTableStore((s) => s.hostCloseSession);
  const lastReceiptPreviewId = useRunTableStore((s) => s.lastReceiptPreviewId);

  const perms = useSessionPermissions();
  const t = useThemeTokens();

  const [statsSheetOpen, setStatsSheetOpen] = useState(false);
  const [closeHostModalOpen, setCloseHostModalOpen] = useState(false);
  const [hostRosterOpen, setHostRosterOpen] = useState(false);
  const [finishCelebration, setFinishCelebration] = useState<Receipt | null>(null);
  const [shareBanner, setShareBanner] = useState(false);

  const isArchived = sessionPhase === 'CLOSED';
  const isLiveActive = sessionPhase === 'LIVE';

  useLiveRealtime(isLiveActive, distanceKm);

  const myRunStatus = participantRuns[authUser.id]?.status ?? 'READY';

  const formattedTime = useMemo(() => {
    const s = Math.floor(elapsedMs / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }, [elapsedMs]);

  const progressKm = useMemo(() => {
    const vals = participants.map((p) => (packPositions[p.id] ?? 0) * distanceKm);
    if (!vals.length) return distanceKm * 0.18;
    return Math.max(...vals);
  }, [distanceKm, packPositions, participants]);

  const iconMuted = t.muted;

  const onFinishPersonal = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const r = finishPersonalRun();
    if (r) setFinishCelebration(r);
  }, [finishPersonalRun]);

  const onLeave = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isLiveActive) leaveSessionSelf();
    router.back();
  }, [leaveSessionSelf, router, isLiveActive]);

  const onConfirmCloseSession = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    hostCloseSession();
    setCloseHostModalOpen(false);
  }, [hostCloseSession]);

  const openGroupReceipt = useCallback(() => {
    const id = lastReceiptPreviewId;
    if (id) router.push({ pathname: '/run/receipt', params: { id } });
  }, [lastReceiptPreviewId, router]);

  const onShareRoomMock = useCallback(() => {
    void Haptics.selectionAsync();
    setShareBanner(true);
    setTimeout(() => setShareBanner(false), 2400);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: t.background }} className="flex-1">
      <Header title={isArchived ? 'ARCHIVED · PACK' : 'LIVE · PACK'} onBackPress={() => router.back()} />

      {shareBanner ? (
        <View className="absolute left-0 right-0 top-[52px] z-50 mx-6 border border-runtable-border bg-runtable-surface px-3 py-2">
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-center text-[10px] text-runtable-muted">
            MOCK SHARE · ROOM CODE ON CLIPBOARD (UI ONLY)
          </Text>
        </View>
      ) : null}

      {isArchived ? (
        <View className="border-b border-runtable-border bg-runtable-surface px-6 py-4">
          <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[10px] uppercase leading-relaxed text-runtable-muted">
            SESSION ARCHIVED
          </Text>
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-2 text-[11px] text-runtable-faint">
            Leaderboard locked · group receipt minted · personal slips still in archive
          </Text>
          <PixelButton variant="outline" className="mt-4" label="VIEW GROUP RECEIPT" onPress={openGroupReceipt} />
        </View>
      ) : null}

      <View className="px-6 pb-3 pt-1">
        <Text
          style={{ fontFamily: 'IBMPlexMono_400Regular' }}
          className="text-[10px] uppercase tracking-[0.35em] text-runtable-faint">
          ELAPSED
        </Text>
        <View className="mt-2 flex-row items-end justify-between">
          <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[36px] text-runtable-text">
            {formattedTime}
          </Text>
          <View className="items-end">
            <Text
              style={{ fontFamily: 'IBMPlexMono_400Regular' }}
              className="text-[9px] uppercase tracking-[0.3em] text-runtable-faint">
              PULSE / KM
            </Text>
            <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[13px] text-runtable-muted">
              {currentPaceLabel}
            </Text>
          </View>
        </View>
        <View className="mt-3 flex-row flex-wrap gap-2">
          <View className="border border-runtable-border bg-runtable-surface px-2 py-1">
            <Text
              style={{ fontFamily: 'IBMPlexMono_600SemiBold' }}
              className="text-[9px] uppercase tracking-widest text-runtable-muted">
              ROOM · {sessionPhase}
            </Text>
          </View>
          <View className="border border-runtable-border bg-black px-2 py-1">
            <Text
              style={{ fontFamily: 'IBMPlexMono_600SemiBold' }}
              className="text-[9px] uppercase tracking-widest text-runtable-faint">
              YOU · {myRunStatus}
            </Text>
          </View>
        </View>
      </View>

      <ThermalCard className="mx-6 mb-4 border-runtable-border p-4">
        <Text
          style={{ fontFamily: 'IBMPlexMono_400Regular' }}
          className="mb-4 text-[10px] uppercase tracking-[0.3em] text-runtable-muted">
          HORIZONTAL PACK TRACK
        </Text>
        <PackTracker
          participants={participants}
          positions={packPositions}
          participantRuns={participantRuns}
          height={118}
        />
        <DottedDivider className="mt-6" />
        <View className="mt-4 flex-row justify-between">
          <View>
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[9px] uppercase text-runtable-faint">
              MOCK DIST
            </Text>
            <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[13px] text-runtable-text">
              {progressKm.toFixed(2)} KM
            </Text>
          </View>
          <View className="items-end">
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[9px] uppercase text-runtable-faint">
              TARGET
            </Text>
            <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[13px] text-runtable-text">
              {distanceKm.toFixed(2)} KM
            </Text>
          </View>
        </View>
      </ThermalCard>

      <View className="flex-1 px-6 pb-80">
        <View className="mb-3 flex-row items-center justify-between">
          <Text
            style={{ fontFamily: 'IBMPlexMono_600SemiBold' }}
            className="text-[11px] uppercase tracking-[0.28em] text-runtable-muted">
            ORDER WINDOW
          </Text>
          {perms.canViewLiveStats && !isArchived ? (
            <Pressable hitSlop={8} onPress={() => setStatsSheetOpen((v) => !v)}>
              <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[10px] uppercase text-runtable-faint">
                {statsSheetOpen ? 'CLOSE STATS' : 'OPEN STATS'}
              </Text>
            </Pressable>
          ) : null}
        </View>
        {leaderboard.slice(0, 5).map((entry) => (
          <LeaderboardItem
            key={entry.participantId}
            entry={entry}
            runStatus={participantRuns[entry.participantId]?.status}
          />
        ))}
        {statsSheetOpen && perms.canViewLiveStats && !isArchived ? (
          <ThermalCard className="mt-4 p-4">
            <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[11px] uppercase text-runtable-muted">
              PACK METRICS · MOCK STREAM
            </Text>
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-2 text-[10px] text-runtable-faint">
              BELIEVABLE JITTERS ONLY — NO GPS LOCK
            </Text>
            <View className="mt-4 gap-3">
              {participants.slice(0, 6).map((p) => (
                <View
                  key={p.id}
                  className="flex-row items-center justify-between border border-runtable-border bg-runtable-surface px-3 py-2">
                  <View>
                    <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[11px] uppercase text-runtable-text">
                      {p.name}
                    </Text>
                    <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[9px] text-runtable-faint">
                      POSITION DRIFT MOCK
                    </Text>
                  </View>
                  <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[11px] text-runtable-muted">
                    {((packPositions[p.id] ?? 0) * 100).toFixed(0)}%
                  </Text>
                </View>
              ))}
            </View>
          </ThermalCard>
        ) : null}
      </View>

      <View className="pointer-events-none absolute inset-0 items-center justify-start pt-48">
        {isLiveActive
          ? cheerEvents.slice(-6).map((c, idx) => (
              <Text
                key={c.id}
                className="absolute font-mono text-[30px] text-runtable-text"
                style={{ top: 120 + idx * 40, opacity: 0.55 }}>
                {c.glyph}
              </Text>
            ))
          : null}
      </View>

      {/* Finish celebration — in-room before optional receipt */}
      {finishCelebration ? (
        <View className="absolute inset-0 z-40 justify-end bg-black/70 px-4 pb-10 pt-24">
          <Animated.View entering={FadeInDown.springify().damping(22).stiffness(180)}>
            <ThermalCard elevated className="border-runtable-border p-5">
              <Animated.View entering={FadeIn.duration(360)}>
                <Text
                  style={{ fontFamily: 'IBMPlexMono_400Regular' }}
                  className="text-center text-[10px] uppercase tracking-[0.35em] text-runtable-faint">
                  RUN SAVED
                </Text>
                <Text
                  style={{ fontFamily: 'PressStart2P_400Regular' }}
                  className="mt-4 text-center text-[11px] leading-relaxed text-runtable-text">
                  SLIP PRINTING…
                </Text>
                <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-3 text-center text-[11px] text-runtable-muted">
                  {finishCelebration.distanceKm.toFixed(2)} KM · {finishCelebration.paceSummary}
                </Text>
                <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="mt-2 text-center text-[12px] text-runtable-text">
                  PLACE ·{' '}
                  {finishCelebration.participantLines?.[0]?.rank?.toString().padStart(2, '0') ?? '—'}
                </Text>
                <View className="mt-4 flex-row flex-wrap justify-center gap-2">
                  {finishCelebration.badges?.slice(0, 3).map((b) => (
                    <View key={b.id} className="border border-runtable-border px-2 py-1">
                      <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[9px] text-runtable-muted">
                        {b.label}
                      </Text>
                    </View>
                  ))}
                </View>
                <PixelButton
                  variant="solid"
                  className="mt-6"
                  label="VIEW RECEIPT"
                  onPress={() => {
                    const id = finishCelebration.id;
                    setFinishCelebration(null);
                    router.push({ pathname: '/run/receipt', params: { id } });
                  }}
                />
                <PixelButton
                  variant="outline"
                  className="mt-3"
                  label="STAY IN ROOM"
                  onPress={() => setFinishCelebration(null)}
                />
              </Animated.View>
            </ThermalCard>
          </Animated.View>
        </View>
      ) : null}

      <View
        style={{ borderTopColor: t.border, backgroundColor: t.background }}
        className="absolute bottom-0 left-0 right-0 border-t px-6 pb-6 pt-3">
        {!isArchived ? (
          <>
            <View className="flex-row items-center justify-between">
              <Pressable
                onPress={() => router.back()}
                className="h-14 w-14 items-center justify-center border border-runtable-border bg-runtable-card active:opacity-80">
                <StepBack color={iconMuted} size={22} strokeWidth={1.3} />
              </Pressable>
              <Pressable
                disabled={!perms.canControlSessionPause}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  togglePause();
                }}
                className="h-14 w-14 items-center justify-center border border-runtable-border bg-runtable-surface active:opacity-80 disabled:opacity-35">
                {paused ? <Play color="#FFFFFF" size={22} /> : <Pause color="#FFFFFF" size={22} />}
              </Pressable>
              <Pressable
                disabled={!isLiveActive}
                onPress={() => {
                  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  const g = GLYPHS[(cheerEvents.length + formattedTime.length) % GLYPHS.length] ?? '◇';
                  addCheer(g);
                }}
                className="h-14 w-14 items-center justify-center border border-runtable-border bg-runtable-card active:opacity-80 disabled:opacity-35">
                <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[16px] text-runtable-text">
                  !
                </Text>
              </Pressable>
            </View>
            {isLiveActive ? (
              <View className="mt-2 flex-row flex-wrap justify-center gap-2">
                {REACTIONS.map((r) => (
                  <Pressable
                    key={r.label}
                    disabled={!isLiveActive}
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      addCheer(r.glyph);
                    }}
                    className="border border-runtable-border bg-runtable-surface px-2 py-1.5 active:opacity-80">
                    <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[9px] uppercase text-runtable-muted">
                      {r.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </>
        ) : (
          <View className="gap-3">
            <PixelButton variant="outline" label="BACK TO MAP" onPress={() => router.replace('/')} />
          </View>
        )}

        {!isArchived && isLiveActive ? (
          <>
            <LiveActionBar onRegroupPing={(label) => addCheer(`⊕ ${label}`)} />
            <View className="mt-4 flex-row flex-wrap gap-2">
              <Pressable
                disabled={!perms.canFinishPersonalRun}
                onPress={onFinishPersonal}
                className="min-w-[31%] flex-1 border border-runtable-border bg-runtable-card py-3 active:opacity-80 disabled:opacity-40">
                <Text
                  style={{ fontFamily: 'IBMPlexMono_600SemiBold' }}
                  className="text-center text-[9px] uppercase tracking-[0.18em] text-runtable-muted">
                  {myRunStatus === 'FINISHED' ? 'RUN SAVED' : 'FINISH MY RUN'}
                </Text>
              </Pressable>
              <Pressable
                disabled={!perms.canLeaveLiveSession}
                onPress={onLeave}
                className="min-w-[31%] flex-1 border border-runtable-border bg-runtable-surface py-3 active:opacity-80 disabled:opacity-40">
                <Text
                  style={{ fontFamily: 'IBMPlexMono_600SemiBold' }}
                  className="text-center text-[9px] uppercase tracking-[0.2em] text-runtable-muted">
                  LEAVE SESSION
                </Text>
              </Pressable>
              <Pressable
                disabled={!perms.canViewLiveStats}
                onPress={() => {
                  void Haptics.selectionAsync();
                  setStatsSheetOpen((v) => !v);
                }}
                className="min-w-[31%] flex-1 border border-runtable-border bg-runtable-card py-3 active:opacity-80 disabled:opacity-40">
                <Text
                  style={{ fontFamily: 'IBMPlexMono_600SemiBold' }}
                  className="text-center text-[9px] uppercase tracking-[0.2em] text-runtable-muted">
                  VIEW LIVE STATS
                </Text>
              </Pressable>
            </View>

            {perms.isEffectiveHost ? (
              <HostSessionBar
                iconMuted={iconMuted}
                onCloseSession={() => setCloseHostModalOpen(true)}
                onViewParticipants={() => setHostRosterOpen(true)}
                onShareRoom={onShareRoomMock}
              />
            ) : null}
          </>
        ) : null}
      </View>

      <Modal
        visible={closeHostModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCloseHostModalOpen(false)}>
        <View className="flex-1 justify-center bg-black/84 px-5">
          <ThermalCard elevated className="border-runtable-border p-5">
            <Text
              style={{ fontFamily: 'IBMPlexMono_400Regular' }}
              className="text-center text-[10px] uppercase tracking-[0.35em] text-runtable-faint">
              HOST ACTION
            </Text>
            <Text
              style={{ fontFamily: 'PressStart2P_400Regular' }}
              className="mt-4 text-center text-[11px] leading-relaxed text-runtable-text">
              CLOSE RUN SESSION?
            </Text>
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-4 text-[10px] leading-5 text-runtable-muted">
              · Stop new participants{'\n'}· Finalize rankings{'\n'}· Archive room{'\n'}· Personal receipts stay in archive
            </Text>
            <PixelButton
              variant="outline"
              className="mt-6"
              label="CANCEL"
              onPress={() => setCloseHostModalOpen(false)}
            />
            <PixelButton variant="solid" className="mt-3" label="CLOSE SESSION" onPress={onConfirmCloseSession} />
          </ThermalCard>
        </View>
      </Modal>

      <Modal
        visible={hostRosterOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setHostRosterOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/70" onPress={() => setHostRosterOpen(false)}>
          <Pressable className="max-h-[72%] rounded-t-lg border border-runtable-border bg-runtable-card" onPress={(e) => e.stopPropagation()}>
            <View className="border-b border-runtable-border px-4 py-3">
              <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[11px] uppercase tracking-widest text-runtable-muted">
                PARTICIPANTS · LIVE
              </Text>
            </View>
            <ScrollView className="px-4 py-3" keyboardShouldPersistTaps="handled">
              {participants.map((p) => {
                const st = participantRuns[p.id]?.status ?? 'READY';
                return (
                  <View
                    key={p.id}
                    className="mb-2 flex-row items-center justify-between border border-runtable-border bg-runtable-surface px-3 py-2">
                    <View className="flex-1">
                      <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[11px] text-runtable-text">
                        {p.name}
                        {p.isHost ? ' · HOST' : ''}
                      </Text>
                      <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[9px] text-runtable-faint">
                        RUN · {st}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
            <View className="border-t border-runtable-border p-4">
              <PixelButton variant="outline" label="DISMISS" onPress={() => setHostRosterOpen(false)} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
