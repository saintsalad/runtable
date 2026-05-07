import { BlurView } from 'expo-blur';
import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

type GlassCardProps = PropsWithChildren<{
  className?: string;
}>;

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <View className={`overflow-hidden rounded-3xl border border-white/10 ${className ?? ''}`}>
      <BlurView intensity={28} tint="dark" className="bg-black/30">
        {children}
      </BlurView>
    </View>
  );
}
