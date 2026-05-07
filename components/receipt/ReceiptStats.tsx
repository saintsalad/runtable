import { memo } from 'react';
import { Text, View } from 'react-native';

import { DottedDivider } from '@/components/ui/DottedDivider';

type ReceiptStatsProps = {
  routeLabel: string;
  distanceLabel: string;
  timeLabel: string;
  paceLabel: string;
  runnersLabel: string;
};

export const ReceiptStats = memo(function ReceiptStats({
  routeLabel,
  distanceLabel,
  timeLabel,
  paceLabel,
  runnersLabel,
}: ReceiptStatsProps) {
  return (
    <View>
      <StatLine k="ROUTE" v={routeLabel} />
      <DottedDivider className="my-2" />
      <StatLine k="DISTANCE" v={distanceLabel} />
      <StatLine k="TIME" v={timeLabel} />
      <StatLine k="PACE" v={paceLabel} />
      <StatLine k="RUNNERS" v={runnersLabel} />
    </View>
  );
});

function StatLine({ k, v }: { k: string; v: string }) {
  return (
    <View className="mb-2">
      <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[9px] uppercase tracking-[0.35em] text-black/45">
        {k}
      </Text>
      <Text
        style={{ fontFamily: 'IBMPlexMono_600SemiBold' }}
        className="mt-1 text-[15px] uppercase tracking-wide text-runtable-ink">
        {v}
      </Text>
    </View>
  );
}
