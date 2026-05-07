import { Image } from 'expo-image';
import { memo } from 'react';
import { Text, View } from 'react-native';

import { DottedDivider } from '@/components/ui/DottedDivider';
import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';
import type { ReceiptParticipantLine } from '@/types';

type ReceiptParticipantsProps = {
  lines: ReceiptParticipantLine[];
};

export const ReceiptParticipants = memo(function ReceiptParticipants({
  lines,
}: ReceiptParticipantsProps) {
  const t = useThemeTokens();
  if (!lines.length) return null;

  return (
    <View className="mt-4">
      <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.thermalInk, opacity: 0.45 }} className="text-[9px] uppercase tracking-[0.35em]">
        PACK ORDER
      </Text>
      <DottedDivider className="my-2" />
      {lines.map((row) => (
        <View
          key={`${row.rank}-${row.displayName}`}
          className="mb-2 flex-row items-center border-b pb-2"
          style={{ borderBottomColor: t.mode === 'dark' ? 'rgba(0,0,0,0.08)' : 'rgba(43,43,43,0.1)' }}>
          {row.portraitUri ? (
            <View
              className="mr-2 overflow-hidden border"
              style={{ borderColor: t.thermalInk, width: 36, height: 36, borderRadius: 2 }}>
              <Image source={{ uri: row.portraitUri }} style={{ width: 34, height: 34 }} contentFit="cover" />
            </View>
          ) : (
            <View
              className="mr-2 items-center justify-center border"
              style={{ borderColor: t.thermalInk, width: 36, height: 36, borderRadius: 2, opacity: 0.4 }}>
              <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.thermalInk }} className="text-[10px]">
                ◇
              </Text>
            </View>
          )}
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.thermalInk }} className="w-7 font-mono text-[12px]">
            {row.rank.toString().padStart(2, '0')}
          </Text>
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.thermalInk }} className="flex-1 font-mono text-[12px] uppercase tracking-wide">
            {row.displayName.padEnd(12, ' ').slice(0, 12)}
          </Text>
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.thermalInk, opacity: 0.85 }} className="w-20 text-right font-mono text-[11px]">
            {row.paceQuote}
          </Text>
        </View>
      ))}
    </View>
  );
});
