import { memo, useMemo } from 'react';
import { Text, View } from 'react-native';

import { ReceiptParticipants } from '@/components/receipt/ReceiptParticipants';
import { ReceiptRoute } from '@/components/receipt/ReceiptRoute';
import { ReceiptStats } from '@/components/receipt/ReceiptStats';
import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';
import type { Receipt, ReceiptBadge } from '@/types';

export type ReceiptSlipBodyProps = {
  receipt: Receipt;
  stampDate: string;
  distLabel: string;
};

export const ReceiptSlipBody = memo(function ReceiptSlipBody({
  receipt,
  stampDate,
  distLabel,
}: ReceiptSlipBodyProps) {
  const t = useThemeTokens();

  const moodLine = useMemo(() => receipt.runMoodLabel, [receipt.runMoodLabel]);

  return (
    <>
      <Text
        style={{ fontFamily: 'PressStart2P_400Regular', color: t.thermalInk }}
        className="text-center text-[11px] uppercase leading-relaxed">
        RUN TABLE
      </Text>
      <Text
        style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.thermalInk }}
        className="mt-3 text-center text-[10px] uppercase tracking-[0.4em]">
        GROUP RUN RECEIPT
      </Text>

      <View className="my-5 h-px" style={{ backgroundColor: t.mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(43,43,43,0.12)' }} />

      <ReceiptStats
        routeLabel={receipt.routeName}
        distanceLabel={distLabel}
        timeLabel={receipt.durationLabel}
        paceLabel={receipt.paceSummary}
        runnersLabel={receipt.runnerCountLabel ?? `${receipt.participantIds.length} PARTICIPANTS`}
      />

      {moodLine ? (
        <View className="mt-2 border px-2 py-1" style={{ borderColor: t.border }}>
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.thermalInk }} className="text-[9px] uppercase">
            MOOD · {moodLine}
          </Text>
        </View>
      ) : null}

      {receipt.groupCollectiveLine ? (
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.thermalInk }} className="mt-2 text-[10px] uppercase">
          {receipt.groupCollectiveLine}
        </Text>
      ) : null}

      <View className="mt-4">
        <ReceiptRoute polylineId={receipt.polylineId} height={132} />
      </View>

      <ReceiptParticipants lines={receipt.participantLines ?? []} />

      <View
        className="mt-5 border border-dashed px-3 py-2"
        style={{
          borderColor: t.mode === 'dark' ? 'rgba(0,0,0,0.25)' : t.border,
          backgroundColor: t.mode === 'dark' ? 'rgba(0,0,0,0.05)' : 'rgba(43,43,43,0.04)',
        }}>
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.thermalInk }} className="text-[9px] uppercase tracking-[0.35em] opacity-50">
          WEATHER / STAMP
        </Text>
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.thermalInk, opacity: 0.85 }} className="mt-2 text-[11px]">
          {receipt.weatherLabel ?? '—'}
        </Text>
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.thermalInk }} className="mt-2 text-[10px] opacity-45">
          {stampDate}
        </Text>
      </View>

      <View className="mt-4 flex-row flex-wrap gap-2">
        {receipt.badges.map((b: ReceiptBadge) => (
          <View
            key={b.id}
            className="border px-2 py-1"
            style={{ borderColor: t.mode === 'dark' ? 'rgba(0,0,0,0.25)' : t.border }}>
            <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.thermalInk, opacity: 0.9 }} className="text-[9px] uppercase">
              {b.label}
            </Text>
          </View>
        ))}
      </View>

      <View className="mt-6 items-center border-t border-dashed pt-4" style={{ borderTopColor: t.mode === 'dark' ? 'rgba(0,0,0,0.2)' : t.border }}>
        {receipt.footerQuote ? (
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.thermalInk }} className="mb-3 text-center text-[10px] uppercase tracking-widest opacity-60">
            {receipt.footerQuote}
          </Text>
        ) : null}
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.thermalInk }} className="text-[9px] uppercase tracking-[0.45em] opacity-40">
          ··· CUT HERE ···
        </Text>
      </View>
    </>
  );
});
