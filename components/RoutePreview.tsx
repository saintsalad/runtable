import { memo, useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import MapView, { Polyline as MapPolyline, PROVIDER_DEFAULT } from 'react-native-maps';

import { useRuntableLegacyColors } from '@/hooks/useRuntableLegacyColors';
import { useThemedTw } from '@/hooks/useThemedTw';
import { polylineById, regionForPolyline } from '@/mocks/routes';

type RoutePreviewProps = {
  polylineId: string;
  variant?: 'thumb' | 'map';
};

export const RoutePreview = memo(function RoutePreview({
  polylineId,
  variant = 'thumb',
}: RoutePreviewProps) {
  const colors = useRuntableLegacyColors();
  const tw = useThemedTw();
  const coords = useMemo(() => polylineById(polylineId), [polylineId]);
  const region = useMemo(() => regionForPolyline(coords), [coords]);

  if (variant === 'map') {
    return (
      <View className="h-56 w-full overflow-hidden rounded-3xl">
        <MapView
          style={{ flex: 1 }}
          provider={PROVIDER_DEFAULT}
          region={region}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}>
          <MapPolyline
            coordinates={coords}
            strokeColor={colors.muted}
            strokeWidth={3}
          />
        </MapView>
      </View>
    );
  }

  const points = coords
    .map((c) => {
      const x = ((c.longitude - region.longitude) / region.longitudeDelta + 0.5) * 100;
      const y = (0.5 - (c.latitude - region.latitude) / region.latitudeDelta) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <View className={`h-full w-full ${tw.bg}`}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Polyline
          points={points}
          fill="none"
          stroke={colors.muted}
          strokeWidth={2}
          strokeDasharray="4 4"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </Svg>
    </View>
  );
});
