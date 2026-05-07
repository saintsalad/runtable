import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { DottedDivider } from '@/components/ui/DottedDivider';
import { PaceBadge } from '@/components/PaceBadge';
import { RoutePreview } from '@/components/RoutePreview';
import type { RunListing } from '@/types';

function initialsFromName(name: string): string {
  const p = name.trim().split(/\s+/);
  const a = p[0]?.[0] ?? '?';
  const b = p[1]?.[0] ?? '';
  return `${a}${b}`.toUpperCase();
}

type RunCardProps = {
  run: RunListing;
  onPress?: (run: RunListing) => void;
  layout?: 'carousel' | 'feed';
};

/** Stamped thermal listing — receipt strip layout. */
export const RunCard = memo(function RunCard({ run, onPress, layout = 'carousel' }: RunCardProps) {
  const widthClass = layout === 'carousel' ? 'mr-4 w-72' : 'w-full';

  return (
    <Pressable
      onPress={() => onPress?.(run)}
      className={`overflow-hidden border border-runtable-border bg-runtable-card active:opacity-95 ${widthClass}`}>
      <View className="h-24 w-full overflow-hidden border-b border-runtable-border">
        <RoutePreview polylineId={run.polylineId} variant="thumb" />
      </View>
      <View className="gap-2 px-4 pb-4 pt-3">
        <Text
          style={{ fontFamily: 'IBMPlexMono_600SemiBold' }}
          className="text-[12px] uppercase tracking-[0.18em] text-runtable-text"
          numberOfLines={2}>
          {run.routeName}
        </Text>
        <DottedDivider />
        <View className="flex-row items-center justify-between gap-2">
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[10px] uppercase tracking-widest text-runtable-faint">
            PACE {run.paceMin}–{run.paceMax}
          </Text>
          <PaceBadge zone={run.paceZone} compact />
        </View>
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[11px] uppercase tracking-wide text-runtable-muted">
          {run.filled} OF {run.capacity} RUNNERS
        </Text>
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[10px] uppercase tracking-widest text-runtable-faint">
          {run.distanceKm.toFixed(2)} KM
        </Text>
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[10px] uppercase tracking-wide text-runtable-muted">
          STARTS {run.startTimeLabel.toUpperCase()}
        </Text>
        <DottedDivider />
        <View className="flex-row items-center gap-2">
          <View className="h-9 w-9 items-center justify-center border border-runtable-border bg-runtable-surface">
            <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[10px] text-runtable-text">
              {initialsFromName(run.host.name)}
            </Text>
          </View>
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[11px] uppercase tracking-widest text-runtable-muted">
            {run.host.name}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});
