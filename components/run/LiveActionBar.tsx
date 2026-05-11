import * as Haptics from 'expo-haptics';
import { AlertTriangle, RotateCcw, X } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PixelButton } from '@/components/ui/PixelButton';
import { ThermalCard } from '@/components/ui/ThermalCard';
import { DottedDivider } from '@/components/ui/DottedDivider';
import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';

type RegroupPoint = {
  id: string;
  label: string;
  glyph: string;
};

const REGROUP_POINTS: RegroupPoint[] = [
  { id: 'rg-water', label: 'WATER STOP', glyph: '▽' },
  { id: 'rg-coffee', label: 'COFFEE STOP', glyph: '◆' },
  { id: 'rg-photo', label: 'PHOTO STOP', glyph: '□' },
  { id: 'rg-wait', label: 'WAIT HERE', glyph: '◇' },
];

type LiveActionBarProps = {
  onRegroupPing: (label: string) => void;
};

export function LiveActionBar({ onRegroupPing }: LiveActionBarProps) {
  const t = useThemeTokens();
  const [sosOpen, setSosOpen] = useState(false);
  const [regroupOpen, setRegroupOpen] = useState(false);
  const [sosConfirmed, setSosConfirmed] = useState(false);
  const [regroupSent, setRegroupSent] = useState<string | null>(null);

  const triggerSOS = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setSosConfirmed(true);
    setTimeout(() => {
      setSosConfirmed(false);
      setSosOpen(false);
    }, 3000);
  }, []);

  const sendRegroup = useCallback((point: RegroupPoint) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRegroupSent(point.label);
    onRegroupPing(point.label);
    setTimeout(() => {
      setRegroupSent(null);
      setRegroupOpen(false);
    }, 2200);
  }, [onRegroupPing]);

  return (
    <>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
        {/* Regroup ping */}
        <Pressable
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setRegroupOpen(true);
          }}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            borderWidth: 1,
            borderColor: t.border,
            backgroundColor: t.card,
            paddingVertical: 12,
            borderRadius: 4,
          }}
          className="active:opacity-70">
          <RotateCcw color={t.muted} size={14} strokeWidth={1.6} />
          <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.muted, fontSize: 9, textTransform: 'uppercase', letterSpacing: 2 }}>
            REGROUP
          </Text>
        </Pressable>

        {/* SOS */}
        <Pressable
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setSosOpen(true);
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            borderWidth: 1,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239,68,68,0.08)',
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 4,
          }}
          className="active:opacity-70">
          <AlertTriangle color="#ef4444" size={14} strokeWidth={1.6} />
          <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: '#ef4444', fontSize: 9, textTransform: 'uppercase', letterSpacing: 2 }}>
            SOS
          </Text>
        </Pressable>
      </View>

      {/* SOS Modal */}
      <Modal visible={sosOpen} transparent animationType="fade" onRequestClose={() => setSosOpen(false)}>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.88)', padding: 20 }}>
          <Animated.View entering={FadeInDown.springify().damping(20)}>
            <ThermalCard elevated className="p-6">
              <Pressable
                onPress={() => setSosOpen(false)}
                style={{ position: 'absolute', top: 12, right: 12 }}
                hitSlop={12}>
                <X color={t.faint} size={16} strokeWidth={1.4} />
              </Pressable>

              <AlertTriangle color="#ef4444" size={28} strokeWidth={1.4} style={{ alignSelf: 'center' }} />

              {sosConfirmed ? (
                <>
                  <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: '#ef4444', fontSize: 13, textAlign: 'center', marginTop: 16, letterSpacing: 2, textTransform: 'uppercase' }}>
                    SOS SENT
                  </Text>
                  <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.muted, fontSize: 11, textAlign: 'center', marginTop: 8, lineHeight: 18 }}>
                    Emergency contacts notified.{'\n'}Host alerted. Stay where you are.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.text, fontSize: 13, textAlign: 'center', marginTop: 16, letterSpacing: 2, textTransform: 'uppercase' }}>
                    EMERGENCY ALERT
                  </Text>
                  <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.muted, fontSize: 11, textAlign: 'center', marginTop: 8, lineHeight: 18 }}>
                    This will alert your host and emergency contacts with your last known location.
                  </Text>
                  <DottedDivider className="my-5" />
                  <View style={{ gap: 10 }}>
                    <Pressable
                      onPress={triggerSOS}
                      style={{
                        backgroundColor: '#ef4444',
                        borderWidth: 1,
                        borderColor: '#ef4444',
                        paddingVertical: 14,
                        alignItems: 'center',
                        borderRadius: 4,
                      }}
                      className="active:opacity-80">
                      <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: '#fff', fontSize: 11, textTransform: 'uppercase', letterSpacing: 3 }}>
                        CONFIRM SOS
                      </Text>
                    </Pressable>
                    <PixelButton variant="outline" label="CANCEL · I'M OK" onPress={() => setSosOpen(false)} />
                  </View>
                </>
              )}
            </ThermalCard>
          </Animated.View>
        </View>
      </Modal>

      {/* Regroup Modal */}
      <Modal visible={regroupOpen} transparent animationType="slide" onRequestClose={() => setRegroupOpen(false)}>
        <Pressable style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }} onPress={() => setRegroupOpen(false)}>
          <Pressable
            style={{ backgroundColor: t.card, borderTopWidth: 1, borderTopColor: t.border, padding: 20, paddingBottom: 36, gap: 12 }}
            onPress={(e) => e.stopPropagation()}>
            <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 3 }}>
              PING REGROUP POINT
            </Text>
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, fontSize: 10, lineHeight: 16 }}>
              Send a stop signal to the pack. All runners will see this ping.
            </Text>
            <DottedDivider className="my-1" />

            {regroupSent ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: '#4ade80', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' }}>
                  ◆ {regroupSent} PINGED
                </Text>
                <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, fontSize: 10, marginTop: 6 }}>
                  Pack has been notified.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                {REGROUP_POINTS.map((rp) => (
                  <Pressable
                    key={rp.id}
                    onPress={() => sendRegroup(rp)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 14,
                      borderWidth: 1,
                      borderColor: t.border,
                      backgroundColor: t.surface,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderRadius: 6,
                    }}
                    className="active:opacity-70">
                    <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.muted, fontSize: 18 }}>
                      {rp.glyph}
                    </Text>
                    <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.text, fontSize: 11, textTransform: 'uppercase', letterSpacing: 2 }}>
                      {rp.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
