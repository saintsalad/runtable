import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { AnimatedCountdown } from '@/components/AnimatedCountdown';
import { RoutePreview } from '@/components/RoutePreview';
import { useRunTableStore } from '@/store';

export default function CountdownScreen() {
  const router = useRouter();
  const polylineId = useRunTableStore((s) => s.currentPolylineId);

  const onComplete = useCallback(() => {
    const { participants, currentDistanceKm, draftRun, authUser } = useRunTableStore.getState();
    const paceLabel =
      draftRun != null
        ? draftRun.paceZone === 'easy'
          ? '6:45 /km'
          : draftRun.paceZone === 'moderate'
            ? '5:55 /km'
            : draftRun.paceZone === 'tempo'
              ? '5:15 /km'
              : '4:40 /km'
        : '5:50 /km';
    useRunTableStore.getState().startActiveRun({
      paceLabel,
      participants: participants.length
        ? participants
        : [
            {
              id: authUser.id,
              name: authUser.displayName,
              avatarColor: '#7CFF6B',
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
    <View className="flex-1 bg-runtable-bg">
      <LinearGradient colors={['#0B0F14', '#132018']} style={{ flex: 1 }}>
        <View className="flex-1 opacity-40">
          <RoutePreview polylineId={polylineId} variant="map" />
        </View>
        <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFillObject} />
        <AnimatedCountdown onComplete={onComplete} />
      </LinearGradient>
    </View>
  );
}
