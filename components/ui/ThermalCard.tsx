import type { PropsWithChildren } from 'react';
import { memo } from 'react';
import { View } from 'react-native';

type ThermalCardProps = PropsWithChildren<{
  className?: string;
  elevated?: boolean;
}>;

export const ThermalCard = memo(function ThermalCard({
  children,
  className = '',
  elevated,
}: ThermalCardProps) {
  const surface = elevated ? 'bg-runtable-surface' : 'bg-runtable-card';
  return (
    <View className={`border border-runtable-border ${surface} ${className}`}>{children}</View>
  );
});
