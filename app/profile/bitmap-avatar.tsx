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
import { processThermalImage, type ColorMode } from '@/lib/bitmap/thermalPortrait';
import { useRunTableStore } from '@/store';

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

// ─── color presets ────────────────────────────────────────────────────────────

type RGB = [number, number, number];

type DuotonePreset = {
  mode: 'duotone';
  label: string;
  fg: RGB;
  bg: RGB;
};

type TritonePreset = {
  mode: 'tritone';
  label: string;
  fg: RGB;
  mid: RGB;
  bg: RGB;
};

type ColorPreset = DuotonePreset | TritonePreset;

const DUOTONE_PRESETS: DuotonePreset[] = [
  { mode: 'duotone', label: 'MONO',   fg: [28, 28, 28],     bg: [248, 248, 248] },
  { mode: 'duotone', label: 'INV',    fg: [240, 240, 240],  bg: [18, 18, 18]    },
  { mode: 'duotone', label: 'GREEN',  fg: [30, 200, 90],    bg: [8, 22, 8]      },
  { mode: 'duotone', label: 'AMBER',  fg: [230, 140, 20],   bg: [18, 8, 0]      },
  { mode: 'duotone', label: 'CYAN',   fg: [0, 210, 225],    bg: [0, 14, 20]     },
  { mode: 'duotone', label: 'RED',    fg: [220, 40, 40],    bg: [16, 0, 0]      },
  { mode: 'duotone', label: 'PAPER',  fg: [40, 28, 16],     bg: [232, 218, 188] },
  { mode: 'duotone', label: 'PURPLE', fg: [185, 80, 255],   bg: [12, 4, 26]     },
];

const TRITONE_PRESETS: TritonePreset[] = [
  { mode: 'tritone', label: 'DUSK',   fg: [18, 14, 36],     mid: [160, 80, 180],   bg: [252, 220, 180] },
  { mode: 'tritone', label: 'FIRE',   fg: [20, 0, 0],       mid: [210, 80, 10],    bg: [255, 230, 80]  },
  { mode: 'tritone', label: 'OCEAN',  fg: [4, 10, 30],      mid: [0, 120, 200],    bg: [180, 240, 255] },
  { mode: 'tritone', label: 'FOREST', fg: [8, 20, 8],       mid: [40, 140, 40],    bg: [210, 240, 180] },
  { mode: 'tritone', label: 'IRON',   fg: [10, 10, 14],     mid: [90, 100, 120],   bg: [220, 224, 232] },
  { mode: 'tritone', label: 'EMBER',  fg: [12, 4, 0],       mid: [180, 50, 10],    bg: [255, 200, 120] },
];

// ─── Stepper ──────────────────────────────────────────────────────────────────

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
      <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.muted, fontSize: 10, letterSpacing: 2 }}>
        {label}
      </Text>
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={() => onChange(clamp(value - step, min, max))}
          style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: t.border }}>
          <Text style={{ color: t.text }}>−</Text>
        </Pressable>
        <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.text, minWidth: 48, textAlign: 'center', fontSize: 12 }}>
          {fmt}
        </Text>
        <Pressable
          onPress={() => onChange(clamp(value + step, min, max))}
          style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: t.border }}>
          <Text style={{ color: t.text }}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SectionLabel({ text }: { text: string }) {
  const t = useThemeTokens();
  return (
    <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.muted, fontSize: 10, letterSpacing: 3 }}>
      {text}
    </Text>
  );
}

function rgbStr(c: RGB) {
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function BitmapAvatarScreen() {
  const router = useRouter();
  const t = useThemeTokens();
  const { width: winW } = useWindowDimensions();
  const authUser = useRunTableStore((s) => s.authUser);

  const [sourceUri, setSourceUri] = useState<string | null>(null);
  const [processedUri, setProcessedUri] = useState<string | null>(null);

  const [pixelSize, setPixelSize] = useState(3);
  const [contrast, setContrast] = useState(1.2);
  const [intensity, setIntensity] = useState(0.45);
  const [selectedPreset, setSelectedPreset] = useState<ColorPreset>(DUOTONE_PRESETS[0]!);

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!sourceUri) { setProcessedUri(null); return; }
    let cancelled = false;
    const handle = setTimeout(() => {
      setBusy(true);
      const p = selectedPreset;
      void processThermalImage(sourceUri, {
        pixelSize,
        contrast,
        intensity,
        colorMode: p.mode as ColorMode,
        fgColor: p.fg,
        bgColor: p.bg,
        midColor: p.mode === 'tritone' ? p.mid : undefined,
      })
        .then((out) => { if (!cancelled) setProcessedUri(out); })
        .catch(() => {})
        .finally(() => { if (!cancelled) setBusy(false); });
    }, 350);
    return () => { cancelled = true; clearTimeout(handle); };
  }, [sourceUri, pixelSize, contrast, intensity, selectedPreset]);

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
      Alert.alert('Photo picker unavailable', 'Rebuild the dev client with expo-image-picker linked.');
    }
  }, []);

  const save = useCallback(() => {
    if (!processedUri) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    useRunTableStore.setState((s) => ({
      authUser: { ...s.authUser, thermalAvatarUri: processedUri, bitmapAvatarUri: processedUri },
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
      <Header title="BITMAP LAB" onBackPress={() => router.back()} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 52, gap: 14 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* upload */}
        <ThermalCard className="p-4">
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, fontSize: 9, letterSpacing: 4 }}>
            BITMAP LAB · THERMAL STAMP
          </Text>
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.muted, fontSize: 11, marginTop: 8 }}>
            Upload → crop → dither → save as thermal stamp.
          </Text>
          <PixelButton variant="solid" className="mt-4" label="UPLOAD PHOTO" onPress={pick} />
        </ThermalCard>

        {/* preview */}
        <ThermalCard className="overflow-hidden p-0">
          <View style={{ width: previewSize, height: previewSize, alignSelf: 'center', backgroundColor: '#000', overflow: 'hidden' }}>
            {preview ? (
              <Image source={{ uri: preview }} style={{ width: previewSize, height: previewSize }} contentFit="cover" />
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, fontSize: 11, textAlign: 'center' }}>
                  NO PHOTO
                </Text>
              </View>
            )}
            <ScanlineOverlay step={4} />
            {busy && (
              <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <ActivityIndicator color={t.muted} />
              </View>
            )}
          </View>
        </ThermalCard>

        {/* image controls */}
        <ThermalCard className="p-4">
          <SectionLabel text="IMAGE" />
          <DottedDivider className="my-3" />
          <Stepper label="PIXEL SIZE"  value={pixelSize} min={2}   max={22}  step={1}    onChange={setPixelSize} />
          <Stepper label="CONTRAST"    value={contrast}  min={0.5} max={2.5} step={0.05} decimals={2} onChange={setContrast} />
          <Stepper label="DITHER"      value={intensity} min={0}   max={1}   step={0.05} decimals={2} onChange={setIntensity} />
        </ThermalCard>

        {/* color presets */}
        <ThermalCard className="p-4">
          <SectionLabel text="DUOTONE" />
          <DottedDivider className="my-3" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {DUOTONE_PRESETS.map((p) => {
              const active = selectedPreset === p;
              return (
                <Pressable
                  key={p.label}
                  onPress={() => setSelectedPreset(p)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingVertical: 7,
                    paddingHorizontal: 10,
                    borderWidth: active ? 1.5 : 1,
                    borderColor: active ? t.text : t.border,
                    backgroundColor: active ? t.surface : 'transparent',
                  }}>
                  {/* bg | fg swatch */}
                  <View style={{ flexDirection: 'row', width: 22, height: 14, borderRadius: 2, overflow: 'hidden', borderWidth: 0.5, borderColor: t.border }}>
                    <View style={{ flex: 1, backgroundColor: rgbStr(p.bg) }} />
                    <View style={{ flex: 1, backgroundColor: rgbStr(p.fg) }} />
                  </View>
                  <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', fontSize: 9, color: active ? t.text : t.muted, letterSpacing: 1.5 }}>
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <DottedDivider className="my-4" />
          <SectionLabel text="TRITONE" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {TRITONE_PRESETS.map((p) => {
              const active = selectedPreset === p;
              return (
                <Pressable
                  key={p.label}
                  onPress={() => setSelectedPreset(p)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingVertical: 7,
                    paddingHorizontal: 10,
                    borderWidth: active ? 1.5 : 1,
                    borderColor: active ? t.text : t.border,
                    backgroundColor: active ? t.surface : 'transparent',
                  }}>
                  {/* bg | mid | fg swatch */}
                  <View style={{ flexDirection: 'row', width: 30, height: 14, borderRadius: 2, overflow: 'hidden', borderWidth: 0.5, borderColor: t.border }}>
                    <View style={{ flex: 1, backgroundColor: rgbStr(p.bg) }} />
                    <View style={{ flex: 1, backgroundColor: rgbStr(p.mid) }} />
                    <View style={{ flex: 1, backgroundColor: rgbStr(p.fg) }} />
                  </View>
                  <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', fontSize: 9, color: active ? t.text : t.muted, letterSpacing: 1.5 }}>
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ThermalCard>

        <PixelButton variant="outline" label="SAVE AVATAR" disabled={!processedUri} onPress={save} />

      </ScrollView>
    </View>
  );
}
