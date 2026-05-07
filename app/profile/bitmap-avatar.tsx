import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { NoiseOverlay } from '@/components/ui/NoiseOverlay';
import { ScanlineOverlay } from '@/components/ui/ScanlineOverlay';
import { Header } from '@/components/ui/Header';
import { PixelButton } from '@/components/ui/PixelButton';
import { ThermalCard } from '@/components/ui/ThermalCard';
import { DottedDivider } from '@/components/ui/DottedDivider';
import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';
import { processThermalImage } from '@/lib/bitmap/thermalPortrait';
import { useRunTableStore } from '@/store';

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

type StepperProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  decimals?: number;
};

function Stepper({ label, value, onChange, min, max, step, decimals = 0 }: StepperProps) {
  const t = useThemeTokens();
  const fmt = decimals ? value.toFixed(decimals) : String(Math.round(value));
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.muted }} className="text-[10px] uppercase tracking-widest">
        {label}
      </Text>
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={() => onChange(clamp(value - step, min, max))}
          className="h-9 w-9 items-center justify-center border px-0"
          style={{ borderColor: t.border }}>
          <Text style={{ color: t.text }}>−</Text>
        </Pressable>
        <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.text }} className="min-w-[48px] text-center text-[12px]">
          {fmt}
        </Text>
        <Pressable
          onPress={() => onChange(clamp(value + step, min, max))}
          className="h-9 w-9 items-center justify-center border px-0"
          style={{ borderColor: t.border }}>
          <Text style={{ color: t.text }}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function BitmapAvatarScreen() {
  const router = useRouter();
  const t = useThemeTokens();
  const { width: winW } = useWindowDimensions();
  const authUser = useRunTableStore((s) => s.authUser);

  const [sourceUri, setSourceUri] = useState<string | null>(null);
  const [processedUri, setProcessedUri] = useState<string | null>(null);
  const [pixelSize, setPixelSize] = useState(8);
  const [contrast, setContrast] = useState(1);
  const [intensity, setIntensity] = useState(0.65);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!sourceUri) {
      setProcessedUri(null);
      return;
    }
    let cancelled = false;
    const handle = setTimeout(() => {
      setBusy(true);
      void processThermalImage(sourceUri, { pixelSize, contrast, intensity })
        .then((out) => {
          if (!cancelled) setProcessedUri(out);
        })
        .finally(() => {
          if (!cancelled) setBusy(false);
        });
    }, 320);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [sourceUri, pixelSize, contrast, intensity]);

  const pick = useCallback(async () => {
    try {
      const ImagePicker = await import('expo-image-picker');
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.92,
      });
      if (!res.canceled && res.assets[0]) setSourceUri(res.assets[0].uri);
    } catch {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Photo picker unavailable',
        'Native image picker is not linked in this build. Rebuild the dev client so expo-image-picker is included: run npx expo prebuild then npx expo run:ios (or run:android), or create a new dev build from EAS.',
      );
    }
  }, []);

  const save = useCallback(() => {
    if (!processedUri) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    useRunTableStore.setState((s) => ({
      authUser: {
        ...s.authUser,
        thermalAvatarUri: processedUri,
        bitmapAvatarUri: processedUri,
      },
      participants: s.participants.map((p) =>
        p.id === s.authUser.id ? { ...p, bitmapAvatarUri: processedUri } : p
      ),
    }));
    router.back();
  }, [processedUri, router]);

  const preview = processedUri ?? sourceUri ?? authUser.bitmapAvatarUri ?? authUser.thermalAvatarUri;
  const previewSize = Math.min(360, winW - 40);

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <NoiseOverlay opacity={0.035} />
      <Header title="THERMAL PORTRAIT" onBackPress={() => router.back()} />
      <ScrollView className="flex-1 px-5 pb-10 pt-4" contentContainerStyle={{ gap: 16 }}>
        <ThermalCard className="p-4">
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint }} className="text-[9px] uppercase tracking-[0.3em]">
            BITMAP LAB · UI ONLY
          </Text>
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.muted }} className="mt-2 text-[11px]">
            Upload → square crop → monochrome error-diffusion → save as thermal stamp for receipts.
          </Text>
          <PixelButton variant="solid" className="mt-4" label="UPLOAD PHOTO" onPress={pick} />
        </ThermalCard>

        <ThermalCard className="overflow-hidden p-0">
          <View
            className="relative self-center overflow-hidden bg-black"
            style={{ width: previewSize, height: previewSize }}>
            {preview ? (
              <Image source={{ uri: preview }} style={{ width: previewSize, height: previewSize }} contentFit="cover" />
            ) : (
              <View className="flex-1 items-center justify-center p-6">
                <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint }} className="text-center text-[11px]">
                  NO PHOTO
                </Text>
              </View>
            )}
            <ScanlineOverlay step={4} />
            {busy ? (
              <View className="absolute inset-0 items-center justify-center bg-black/40">
                <ActivityIndicator color={t.muted} />
              </View>
            ) : null}
          </View>
        </ThermalCard>

        <ThermalCard className="p-4">
          <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.muted }} className="text-[10px] uppercase tracking-widest">
            CONTROLS
          </Text>
          <DottedDivider className="my-3" />
          <Stepper label="PIXEL DENSITY" value={pixelSize} min={3} max={22} step={1} onChange={setPixelSize} />
          <Stepper label="CONTRAST" value={contrast} min={0.5} max={2} step={0.05} decimals={2} onChange={setContrast} />
          <Stepper label="DITHER INT" value={intensity} min={0} max={1} step={0.05} decimals={2} onChange={setIntensity} />
        </ThermalCard>

        <PixelButton variant="outline" label="SAVE AVATAR" disabled={!processedUri} onPress={save} />
      </ScrollView>
    </View>
  );
}
