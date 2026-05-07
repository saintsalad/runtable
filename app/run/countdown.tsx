import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';

import { AnimatedCountdown } from '@/components/AnimatedCountdown';
import { NoiseOverlay } from '@/components/ui/NoiseOverlay';
import { colorForName } from '@/mocks/fixtures';
import { useRunTableStore } from '@/store';

export default function CountdownScreen() {
  const router = useRouter();

  const onComplete = useCallback(() => {
    const { participants, currentDistanceKm, draftRun, authUser } = useRunTableStore.getState();
    const paceLabel =
      draftRun != null
        ? draftRun.paceZone === 'easy'
          ? "06'30\""
          : draftRun.paceZone === 'moderate'
            ? "05'42\""
            : draftRun.paceZone === 'tempo'
              ? "05'10\""
              : "04'35\""
        : "05'50\"";
    useRunTableStore.getState().startActiveRun({
      paceLabel,
      participants: participants.length
        ? participants
        : [
            {
              id: authUser.id,
              name: authUser.displayName,
              avatarColor: colorForName(authUser.displayName),
              paceZone: 'moderate',
              isHost: true,
              isReady: true,
            },
          ],
      distanceKm: currentDistanceKm,
    });
    router.replace('/run/live');
  }, [router]);

  return (
    <View className="flex-1 bg-black">
      <NoiseOverlay opacity={0.08} />
      <AnimatedCountdown onComplete={onComplete} />
    </View>
  );
}
