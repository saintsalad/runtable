import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { QrCode, Share2, Users } from 'lucide-react-native';
import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CapacityBar } from '@/components/CapacityBar';
import { GlassCard } from '@/components/GlassCard';
import { PaceBadge } from '@/components/PaceBadge';
import { ParticipantAvatar } from '@/components/ParticipantAvatar';
import { FREE_TIER_MAX_PARTICIPANTS } from '@/constants/runtable';
import { useLobbyRealtime } from '@/hooks/useMockRealtime';
import { useRunTableStore } from '@/store';
import type { Participant } from '@/types';

function ParticipantRow({
  item,
  isLatest,
}: {
  item: Participant;
  isLatest: boolean;
}) {
  return (
    <Animated.View entering={FadeInRight.springify().damping(18)} className="px-6 pb-3">
      <GlassCard className="flex-row items-center justify-between p-3">
        <View className="flex-row items-center gap-3">
          <ParticipantAvatar
            name={item.name}
            color={item.avatarColor}
            pulse={isLatest}
            isHost={item.isHost}
          />
          <View>
            <Text className="font-semibold text-white">{item.name}</Text>
            <View className="mt-1 flex-row items-center gap-2">
              <PaceBadge zone={item.paceZone} compact />
              <Text className="text-xs text-runtable-muted">
                {item.isReady ? 'Ready' : 'Stretching'}
              </Text>
            </View>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

export default function LobbyScreen() {
  const router = useRouter();
  const participants = useRunTableStore((s) => s.participants);
  const maxParticipants = useRunTableStore((s) => s.maxParticipants);
  const routeName = useRunTableStore((s) => s.currentRouteName);
  const hostId = useRunTableStore((s) => s.lobbyHostId);
  const toggleReady = useRunTableStore((s) => s.toggleReady);

  useLobbyRealtime(participants.length > 0, hostId);

  const latestId = participants[participants.length - 1]?.id;

  const renderItem = useCallback(
    ({ item }: { item: Participant }) => (
      <ParticipantRow item={item} isLatest={item.id === latestId} />
    ),
    [latestId]
  );

  return (
    <SafeAreaView className="flex-1 bg-runtable-bg" edges={['top', 'bottom']}>
      <View className="px-6 pt-4">
        <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-runtable-muted">
          Lobby
        </Text>
        <Text className="mt-2 text-3xl font-bold text-white">{routeName || 'Your run'}</Text>
        <Text className="mt-2 text-runtable-muted">
          Free tier packs cap at {FREE_TIER_MAX_PARTICIPANTS} — UI still breathes at 20+.
        </Text>
      </View>

      <View className="px-6 py-4">
        <CapacityBar filled={participants.length} capacity={Math.min(maxParticipants, 20)} />
      </View>

      <View className="px-6 pb-4">
        <GlassCard className="flex-row items-center gap-4 p-4">
          <View className="h-24 w-24 items-center justify-center rounded-3xl border border-dashed border-white/20 bg-black/40">
            <QrCode color="#7CFF6B" size={40} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-white">Join QR</Text>
            <Text className="mt-1 text-xs text-runtable-muted">Mock anchor — future deep link here.</Text>
            <Pressable
              onPress={() => void Haptics.selectionAsync()}
              className="mt-4 flex-row items-center gap-2 self-start rounded-full bg-white/10 px-4 py-2 active:opacity-90">
              <Share2 color="#7CFF6B" size={16} />
              <Text className="text-sm font-semibold text-white">Invite crew</Text>
            </Pressable>
          </View>
        </GlassCard>
      </View>

      <View className="flex-row items-center justify-between px-6 pb-2">
        <View className="flex-row items-center gap-2">
          <Users color="#94A3B8" size={18} />
          <Text className="font-semibold text-white">At the table</Text>
        </View>
        <Text className="text-xs text-runtable-muted">Tap your card to flip ready</Text>
      </View>

      <FlashList
        data={participants}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      <View className="absolute bottom-0 left-0 right-0 gap-3 border-t border-white/5 bg-runtable-bg/95 px-6 pb-8 pt-4">
        <Pressable
          onPress={() => {
            const self = participants[0];
            if (self) toggleReady(self.id);
          }}
          className="rounded-2xl border border-white/10 py-3 active:bg-white/5">
          <Text className="text-center text-sm font-semibold text-white">Toggle my ready</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.push('/run/countdown');
          }}
          className="rounded-3xl bg-runtable-accent py-4 active:opacity-90">
          <Text className="text-center text-lg font-semibold text-runtable-bg">Start countdown</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
