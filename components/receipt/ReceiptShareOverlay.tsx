import * as Haptics from 'expo-haptics';
import { memo, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { ReceiptSlipBody } from '@/components/receipt/ReceiptSlipBody';
import { ReceiptPaper } from '@/components/ui/ReceiptPaper';
import { PixelButton } from '@/components/ui/PixelButton';
import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';
import type { Receipt } from '@/types';

export type ShareAspect = 'story' | 'square' | 'full';

type ReceiptShareOverlayProps = {
  visible: boolean;
  onClose: () => void;
  receipt: Receipt;
  stampDate: string;
  distLabel: string;
};

function aspectSize(aspect: ShareAspect, maxW: number, maxH: number): { w: number; h: number } {
  switch (aspect) {
    case 'story':
      return { w: Math.min(maxW, 320), h: Math.min(maxH, 520) };
    case 'square':
      return { w: Math.min(maxW, 340), h: Math.min(maxW, 340) };
    case 'full':
    default:
      return { w: Math.min(maxW, 360), h: Math.min(maxH, 560) };
  }
}

export const ReceiptShareOverlay = memo(function ReceiptShareOverlay({
  visible,
  onClose,
  receipt,
  stampDate,
  distLabel,
}: ReceiptShareOverlayProps) {
  const t = useThemeTokens();
  const { width: winW, height: winH } = useWindowDimensions();
  const [aspect, setAspect] = useState<ShareAspect>('full');

  const { w: frameW, h: frameH } = useMemo(
    () => aspectSize(aspect, winW - 32, winH * 0.72),
    [aspect, winH, winW]
  );

  const stub = () => {
    void Haptics.selectionAsync();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close share preview" />
        <View style={styles.content} pointerEvents="box-none">
          <View className="mb-4 flex-row flex-wrap justify-center gap-2 px-3">
            {(['story', 'square', 'full'] as const).map((a) => (
              <PixelButton
                key={a}
                variant={aspect === a ? 'solid' : 'outline'}
                label={a.toUpperCase()}
                className="min-w-[28%] px-2"
                onPress={() => {
                  void Haptics.selectionAsync();
                  setAspect(a);
                }}
              />
            ))}
          </View>
          <Animated.View entering={ZoomIn.duration(320)} style={{ alignSelf: 'center', width: frameW, maxHeight: frameH }}>
            <ScrollView scrollEnabled={aspect === 'full'} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
              <Animated.View entering={FadeIn.duration(280)}>
                <ReceiptPaper>
                  <ReceiptSlipBody receipt={receipt} stampDate={stampDate} distLabel={distLabel} />
                </ReceiptPaper>
              </Animated.View>
            </ScrollView>
          </Animated.View>
          <View className="mt-4 gap-2 px-4">
            <PixelButton variant="solid" label="SAVE TO DEVICE" onPress={stub} />
            <PixelButton variant="outline" label="SHARE STORY" onPress={stub} />
            <PixelButton variant="outline" label="COPY IMAGE" onPress={stub} />
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.muted }} className="text-center text-[9px]">
              UI ONLY · WIRE NATIVE SHARE LATER
            </Text>
            <PixelButton variant="outline" label="CLOSE" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
});
