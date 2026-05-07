import * as Haptics from 'expo-haptics';
import { memo, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { PaceBadge } from '@/components/run/PaceBadge';
import { RunStatusChip, runMoodShort } from '@/components/run/RunStatusChip';
import { ParticipantAvatar } from '@/components/ParticipantAvatar';
import { DottedDivider } from '@/components/ui/DottedDivider';
import { ThermalCard } from '@/components/ui/ThermalCard';
import { paceLabelFor } from '@/mocks/fixtures';
import { useRuntableLegacyColors } from '@/hooks/useRuntableLegacyColors';
import { useThemedTw } from '@/hooks/useThemedTw';
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
  const colors = useRuntableLegacyColors();
  const tw = useThemedTw();

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
          <View className="relative">
            <ParticipantAvatar
              name={item.name}
              color={item.avatarColor}
              pulse={pulse}
              isHost={item.isHost}
            />
            <View className="absolute -right-3 top-0 max-w-[52px] flex-col gap-1">
              <RunStatusChip text={item.isReady ? 'RDY' : 'WAIT'} />
              {runMoodShort(item.runMood) ? (
                <RunStatusChip text={runMoodShort(item.runMood)!} />
              ) : null}
            </View>
          </View>
            <View className="flex-1">
              <View className="flex-row items-start justify-between gap-2">
                <Text className={`font-mono-semibold uppercase text-[12px] tracking-receipt ${tw.text}`}>
                  {item.name}
                </Text>
              </View>

              <View className="mt-2 flex-row flex-wrap items-center gap-2">
                <PaceBadge zone={item.paceZone} compact />
                <Text className={`font-mono text-[10px] uppercase tracking-[0.12em] ${tw.muted}`}>
                  {zoneLabel}
                </Text>
              </View>

              <View className="mt-3 flex-row items-center gap-4">
                <Text className={`font-mono text-[10px] uppercase tracking-[0.2em] ${tw.faint}`}>
                  {item.isReady ? 'READY' : 'STAGING'}
                </Text>
                {showConnected ? (
                  <Text
                    className="font-mono-semibold text-[10px] uppercase tracking-[0.32em]"
                    style={{ color: colors.text }}>
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
