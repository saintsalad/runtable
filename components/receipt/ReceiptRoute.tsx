import { memo, useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';
import { polylineById, regionForPolyline } from '@/mocks/routes';

type ReceiptRouteProps = {
  polylineId: string;
  height?: number;
};

/** Abstract dotted route — ink on thermal paper. */
export const ReceiptRoute = memo(function ReceiptRoute({ polylineId, height = 120 }: ReceiptRouteProps) {
  const t = useThemeTokens();
  const points = useMemo(() => {
    const coords = polylineById(polylineId);
    const region = regionForPolyline(coords);
    return coords
      .map((c) => {
        const x = ((c.longitude - region.longitude) / region.longitudeDelta + 0.5) * 120;
        const y = (0.5 - (c.latitude - region.latitude) / region.latitudeDelta) * 80;
        return `${x},${y}`;
      })
      .join(' ');
  }, [polylineId]);

  return (
    <View
      className="w-full"
      style={{
        height,
        borderWidth: 1,
        borderColor: t.border,
        backgroundColor: t.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(43,43,43,0.04)',
      }}>
      <Svg width="100%" height="100%" viewBox="0 0 120 80" preserveAspectRatio="xMidYMid meet">
        <Polyline
          points={points}
          fill="none"
          stroke={t.thermalInk}
          strokeWidth={1.5}
          strokeDasharray="3 5"
          strokeLinecap="square"
          strokeLinejoin="miter"
          opacity={0.88}
        />
      </Svg>
    </View>
  );
});
