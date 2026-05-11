import { FlashList } from '@shopify/flash-list';
import type { ReactElement } from 'react';
import { memo, useCallback } from 'react';

import { RunnerCard } from '@/components/run/RunnerCard';
import type { Participant } from '@/types';

type LobbyListProps = {
  participants: Participant[];
  latestParticipantId?: string | null;
  footer?: ReactElement | null;
};

export const LobbyList = memo(function LobbyList({
  participants,
  latestParticipantId,
  footer,
}: LobbyListProps) {
  const renderItem = useCallback(
    ({ item }: { item: Participant }) => (
      <RunnerCard
        item={item}
        isLatest={item.id === latestParticipantId}
      />
    ),
    [latestParticipantId]
  );

  return (
    <FlashList
      data={participants}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListFooterComponent={footer}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    />
  );
});
