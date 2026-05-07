import { memo } from 'react';
import { Text, View } from 'react-native';

import { DottedDivider } from '@/components/ui/DottedDivider';
import type { ReceiptParticipantLine } from '@/types';

type ReceiptParticipantsProps = {
  lines: ReceiptParticipantLine[];
};

export const ReceiptParticipants = memo(function ReceiptParticipants({
  lines,
}: ReceiptParticipantsProps) {
  if (!lines.length) return null;

  return (
    <View className="mt-4">
      <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="font-mono text-[9px] uppercase tracking-[0.35em] text-black/45">
        PACK ORDER
      </Text>
      <DottedDivider className="my-2" />
      {lines.map((row) => (
        <View key={`${row.rank}-${row.displayName}`} className="mb-1 flex-row">
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="w-8 font-mono text-[12px] text-runtable-ink">
            {row.rank.toString().padStart(2, '0')}
          </Text>
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="flex-1 font-mono text-[12px] uppercase tracking-wide text-runtable-ink">
            {row.displayName.padEnd(12, ' ').slice(0, 12)}
          </Text>
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="w-20 text-right font-mono text-[12px] text-runtable-ink">
            {row.paceQuote}
          </Text>
        </View>
      ))}
    </View>
  );
});
