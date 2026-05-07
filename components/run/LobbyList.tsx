import { FlashList } from '@shopify/flash-list';
import type { ReactElement } from 'react';
import { memo, useCallback } from 'react';

import { RunnerCard } from '@/components/run/RunnerCard';
import type { Participant } from '@/types';

type LobbyListProps = {
  participants: Participant[];
  latestParticipantId?: string | null;
  onToggleReady?: (id: string) => void;
  footer?: ReactElement | null;
};

export const LobbyList = memo(function LobbyList({
  participants,
  latestParticipantId,
  onToggleReady,
  footer,
}: LobbyListProps) {
  const renderItem = useCallback(
    ({ item }: { item: Participant }) => (
      <RunnerCard
        item={item}
        isLatest={item.id === latestParticipantId}
        onToggleReady={onToggleReady}
      />
    ),
    [latestParticipantId, onToggleReady]
  );

  return (
    <FlashList
      data={participants}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListFooterComponent={footer}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    />
  );
});
