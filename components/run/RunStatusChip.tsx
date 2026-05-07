import { memo } from 'react';
import { Text, View } from 'react-native';

import { useThemedTw } from '@/hooks/useThemedTw';
import type { ParticipantRunStatus } from '@/types/session';

type RunStatusChipProps = {
  /** Short uppercase terminal label */
  text: string;
};

export const RunStatusChip = memo(function RunStatusChip({ text }: RunStatusChipProps) {
  const tw = useThemedTw();
  return (
    <View className={`rounded-sm border ${tw.border} ${tw.bg} px-1 py-0.5`}>
      <Text
        style={{ fontFamily: 'IBMPlexMono_600SemiBold' }}
        className={`text-[7px] uppercase tracking-tighter ${tw.muted}`}>
        {text}
      </Text>
    </View>
  );
});

export function runStatusLabel(st: ParticipantRunStatus): string {
  switch (st) {
    case 'READY':
      return 'RDY';
    case 'RUNNING':
      return 'RUN';
    case 'FINISHED':
      return 'FIN';
    case 'LEFT':
      return 'OUT';
    default:
      return st;
  }
}

export function runMoodShort(mood: string | null | undefined): string | null {
  if (!mood) return null;
  const m = mood.replace(/\s+/g, '');
  return m.length > 6 ? m.slice(0, 6) : m;
}
