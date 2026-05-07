import * as Haptics from 'expo-haptics';
import { memo, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { PaceBadge } from '@/components/run/PaceBadge';
import { ParticipantAvatar } from '@/components/ParticipantAvatar';
import { DottedDivider } from '@/components/ui/DottedDivider';
import { ThermalCard } from '@/components/ui/ThermalCard';
import { RUNTABLE_COLORS } from '@/constants/runtable';
import { paceLabelFor } from '@/mocks/fixtures';
import type { Participant } from '@/types';

export type RunnerCardProps = {
  item: Participant;
  isLatest: boolean;
  onToggleReady?: (id: string) => void;
};

export const RunnerCard = memo(function RunnerCard({
  item,
  isLatest,
  onToggleReady,
}: RunnerCardProps) {
  const [pulse, setPulse] = useState(false);
  const [showConnected, setShowConnected] = useState(false);
  const zoneLabel = paceLabelFor(item.paceZone);

  useEffect(() => {
    if (!isLatest) return;
    setPulse(true);
    setShowConnected(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const pulseOff = setTimeout(() => setPulse(false), 1500);
    const tagOff = setTimeout(() => setShowConnected(false), 1400);
    return () => {
      clearTimeout(pulseOff);
      clearTimeout(tagOff);
    };
  }, [isLatest, item.id]);

  return (
    <Animated.View entering={FadeInRight.springify().damping(20)} className="px-6 pb-3">
      <Pressable disabled={!onToggleReady} onPress={() => onToggleReady?.(item.id)}>
        <ThermalCard className="p-3">
          <View className="flex-row items-center gap-3">
            <ParticipantAvatar
              name={item.name}
              color={item.avatarColor}
              pulse={pulse}
              isHost={item.isHost}
            />
            <View className="flex-1">
              <View className="flex-row items-start justify-between gap-2">
                <Text className="font-mono-semibold uppercase text-[12px] tracking-receipt text-runtable-text">
                  {item.name}
                </Text>
              </View>

              <View className="mt-2 flex-row flex-wrap items-center gap-2">
                <PaceBadge zone={item.paceZone} compact />
                <Text className="font-mono text-[10px] uppercase tracking-[0.12em] text-runtable-muted">
                  {zoneLabel}
                </Text>
              </View>

              <View className="mt-3 flex-row items-center gap-4">
                <Text className="font-mono text-[10px] uppercase tracking-[0.2em] text-runtable-faint">
                  {item.isReady ? 'READY' : 'STAGING'}
                </Text>
                {showConnected ? (
                  <Text
                    className="font-mono-semibold text-[10px] uppercase tracking-[0.32em]"
                    style={{ color: RUNTABLE_COLORS.text }}>
                    CONNECTED
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
          <DottedDivider className="mt-4" />
        </ThermalCard>
      </Pressable>
    </Animated.View>
  );
});
