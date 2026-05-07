import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, Share2, UploadCloud } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Polyline } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/GlassCard';
import { ParticipantAvatar } from '@/components/ParticipantAvatar';
import { RUNTABLE_COLORS } from '@/constants/runtable';
import { polylineById, regionForPolyline } from '@/mocks/routes';
import { useRunTableStore } from '@/store';
import type { Receipt } from '@/types';

function buildPoints(polylineId: string): string {
  const coords = polylineById(polylineId);
  const region = regionForPolyline(coords);
  return coords
    .map((c) => {
      const x = ((c.longitude - region.longitude) / region.longitudeDelta + 0.5) * 120;
      const y = (0.5 - (c.latitude - region.latitude) / region.latitudeDelta) * 80;
      return `${x},${y}`;
    })
    .join(' ');
}

export default function RunReceiptScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const receipts = useRunTableStore((s) => s.receipts);
  const participants = useRunTableStore((s) => s.participants);

  const receipt: Receipt | undefined = useMemo(() => {
    if (id) return receipts.find((r) => r.id === id);
    return receipts[0];
  }, [id, receipts]);

  const polyPoints = useMemo(
    () => buildPoints(receipt?.polylineId ?? 'bgc_loop'),
    [receipt?.polylineId]
  );

  if (!receipt) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-runtable-bg px-8">
        <Text className="text-center text-lg font-semibold text-white">No receipt yet</Text>
        <Text className="mt-2 text-center text-runtable-muted">
          Finish a run to mint your collectible ticket — or start a fresh table.
        </Text>
        <Pressable
          onPress={() => router.replace('/run/create')}
          className="mt-6 rounded-3xl bg-runtable-accent px-6 py-4">
          <Text className="font-semibold text-runtable-bg">Create a run</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const crew = participants.filter((p) => receipt.participantIds.includes(p.id));

  return (
    <SafeAreaView className="flex-1 bg-runtable-bg" edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <Animated.View entering={FadeInDown.duration(520).springify()}>
          <LinearGradient
            colors={['#162031', '#0b0f14', '#132018']}
            style={{ borderRadius: 36, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
            <View className="absolute inset-0 opacity-30">
              <LinearGradient
                colors={['rgba(124,255,107,0.15)', 'transparent', 'rgba(255,255,255,0.04)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
              />
            </View>
            <View className="absolute inset-0 opacity-[0.07]">
              {Array.from({ length: 5 }).map((_, i) => (
                <View
                  key={i}
                  className="absolute h-px w-full bg-white"
                  style={{ top: `${15 + i * 18}%`, opacity: 0.4 }}
                />
              ))}
            </View>

            <View className="p-8">
              <Text className="text-xs font-semibold uppercase tracking-[0.35em] text-runtable-muted">
                Run receipt
              </Text>
              <Text className="mt-3 text-3xl font-black text-white">{receipt.routeName}</Text>
              <View className="mt-4 flex-row flex-wrap gap-2">
                <View className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  <Text className="text-xs font-semibold text-runtable-accent">{receipt.weatherLabel}</Text>
                </View>
                {receipt.badges.map((b) => (
                  <View key={b.id} className="rounded-full border border-runtable-accent/25 bg-runtable-accent/10 px-3 py-1">
                    <Text className="text-xs font-semibold text-runtable-accent">{b.label}</Text>
                  </View>
                ))}
              </View>

              <GlassCard className="mt-6 overflow-hidden">
                <View className="p-4">
                  <Svg width="100%" height={140} viewBox="0 0 120 80">
                    <Polyline
                      points={polyPoints}
                      fill="none"
                      stroke={RUNTABLE_COLORS.accent}
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
              </GlassCard>

              <View className="mt-6 flex-row gap-4">
                <View className="flex-1 rounded-3xl bg-white/5 p-4">
                  <Text className="text-xs text-runtable-muted">Distance</Text>
                  <Text className="mt-2 text-3xl font-bold text-white">{receipt.distanceKm} km</Text>
                </View>
                <View className="flex-1 rounded-3xl bg-white/5 p-4">
                  <Text className="text-xs text-runtable-muted">Time</Text>
                  <Text className="mt-2 text-3xl font-bold text-white">{receipt.durationLabel}</Text>
                </View>
              </View>

              <View className="mt-6">
                <Text className="text-xs uppercase tracking-widest text-runtable-muted">Pace story</Text>
                <Text className="mt-2 text-lg font-semibold text-white">{receipt.paceSummary}</Text>
              </View>

              <View className="mt-6 flex-row items-center justify-between rounded-3xl bg-black/30 p-4">
                <View>
                  <Text className="text-xs text-runtable-muted">Hosted by</Text>
                  <Text className="mt-1 text-base font-semibold text-white">{receipt.hostName}</Text>
                </View>
                <BlurView intensity={20} tint="dark" className="overflow-hidden rounded-2xl border border-dashed border-white/15 px-4 py-3">
                  <Camera color="#94A3B8" size={22} />
                </BlurView>
              </View>

              <Text className="mt-6 text-xs uppercase tracking-widest text-runtable-muted">Crew</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
                <View className="flex-row gap-3 pr-4">
                  {crew.length
                    ? crew.map((p) => (
                        <ParticipantAvatar key={p.id} name={p.name} color={p.avatarColor} size="md" isHost={p.isHost} />
                      ))
                    : receipt.participantIds.map((pid, idx) => (
                        <ParticipantAvatar
                          key={pid}
                          name={`Runner ${idx + 1}`}
                          color={['#7CFF6B', '#38BDF8', '#F472B6'][idx % 3]!}
                          size="md"
                        />
                      ))}
                </View>
              </ScrollView>

              <Text className="mt-4 text-center text-xs text-runtable-muted">{receipt.completedAt}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <View className="mt-6 gap-3">
          <Pressable
            onPress={() => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
            className="rounded-3xl bg-runtable-accent py-4 active:opacity-90">
            <Text className="text-center text-base font-semibold text-runtable-bg">Save receipt</Text>
          </Pressable>
          <Pressable
            onPress={() => void Haptics.selectionAsync()}
            className="flex-row items-center justify-center gap-2 rounded-3xl border border-white/15 py-4 active:bg-white/5">
            <Share2 color="#7CFF6B" size={18} />
            <Text className="text-center text-base font-semibold text-white">Share receipt</Text>
          </Pressable>
          <Pressable
            disabled
            className="flex-row items-center justify-center gap-2 rounded-3xl border border-white/5 bg-white/5 py-4 opacity-40">
            <UploadCloud color="#94A3B8" size={18} />
            <Text className="text-center text-base font-semibold text-runtable-muted">Upload to Strava</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
