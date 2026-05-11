import { memo } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { PaceBadge } from '@/components/run/PaceBadge';
import { ParticipantAvatar } from '@/components/ParticipantAvatar';
import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';
import { paceLabelFor } from '@/mocks/fixtures';
import type { Participant } from '@/types';

export type RunnerCardProps = {
  item: Participant;
  isLatest: boolean;
};

export const RunnerCard = memo(function RunnerCard({ item, isLatest }: RunnerCardProps) {
  const zoneLabel = paceLabelFor(item.paceZone);
  const t = useThemeTokens();

  return (
    <Animated.View entering={FadeInRight.springify().damping(20)} style={{ paddingBottom: 10 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          backgroundColor: t.card,
          borderColor: t.border,
          borderWidth: 1,
          borderRadius: 10,
          padding: 12,
        }}>
        <ParticipantAvatar name={item.name} color={t.border} textColor={t.muted} size="sm" isHost={item.isHost} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.text, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {item.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <PaceBadge zone={item.paceZone} compact />
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {zoneLabel}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
});
