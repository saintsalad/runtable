import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { NoiseOverlay } from '@/components/ui/NoiseOverlay';
import { Header } from '@/components/ui/Header';
import { ThermalCard } from '@/components/ui/ThermalCard';
import { PixelButton } from '@/components/ui/PixelButton';
import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';
import { useRunTableStore } from '@/store';
import { colorForName } from '@/mocks/fixtures';

export default function ProfileTab() {
  const router = useRouter();
  const t = useThemeTokens();
  const authUser = useRunTableStore((s) => s.authUser);

  const initials = authUser.displayName
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const avatarColor = colorForName(authUser.displayName);

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <NoiseOverlay opacity={0.035} />
      <Header hideBack title="PROFILE" />

      <ScrollView contentContainerStyle={{ paddingBottom: 64 }}>
        {/* Avatar + name */}
        <View
          style={{
            alignItems: 'center',
            paddingTop: 24,
            paddingBottom: 28,
            paddingHorizontal: 24,
            borderBottomWidth: 1,
            borderBottomColor: t.border,
          }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: avatarColor,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: t.border,
              marginBottom: 16,
            }}>
            <Text
              style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: '#fff', fontSize: 22 }}>
              {initials}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: 'IBMPlexMono_600SemiBold',
              color: t.text,
              fontSize: 16,
              textTransform: 'uppercase',
              letterSpacing: 4,
            }}>
            {authUser.displayName}
          </Text>
          <Text
            style={{
              fontFamily: 'IBMPlexMono_400Regular',
              color: t.faint,
              fontSize: 11,
              marginTop: 6,
            }}>
            LVL {authUser.level} · {authUser.paceProfile}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <ThermalCard elevated className="flex-1 p-4">
              <Text
                style={{
                  fontFamily: 'IBMPlexMono_400Regular',
                  color: t.faint,
                  fontSize: 8,
                  textTransform: 'uppercase',
                  letterSpacing: 4,
                }}>
                TOTAL RUNS
              </Text>
              <Text
                style={{
                  fontFamily: 'IBMPlexMono_600SemiBold',
                  color: t.text,
                  fontSize: 22,
                  marginTop: 8,
                }}>
                {authUser.totalRuns.toString().padStart(2, '0')}
              </Text>
            </ThermalCard>
            <ThermalCard elevated className="flex-1 p-4">
              <Text
                style={{
                  fontFamily: 'IBMPlexMono_400Regular',
                  color: t.faint,
                  fontSize: 8,
                  textTransform: 'uppercase',
                  letterSpacing: 4,
                }}>
                STREAK
              </Text>
              <Text
                style={{
                  fontFamily: 'IBMPlexMono_600SemiBold',
                  color: t.text,
                  fontSize: 22,
                  marginTop: 8,
                }}>
                {authUser.streak}W
              </Text>
            </ThermalCard>
          </View>

          <ThermalCard className="mb-4 p-4">
            <Text
              style={{
                fontFamily: 'IBMPlexMono_400Regular',
                color: t.faint,
                fontSize: 8,
                textTransform: 'uppercase',
                letterSpacing: 4,
              }}>
              PACE IDENTITY
            </Text>
            <Text
              style={{
                fontFamily: 'IBMPlexMono_600SemiBold',
                color: t.muted,
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: 4,
                marginTop: 12,
              }}>
              {authUser.paceProfile}
            </Text>
          </ThermalCard>

          <ThermalCard className="mb-4 p-4">
            <Text
              style={{
                fontFamily: 'IBMPlexMono_400Regular',
                color: t.faint,
                fontSize: 8,
                textTransform: 'uppercase',
                letterSpacing: 4,
                marginBottom: 8,
              }}>
              THERMAL PORTRAIT
            </Text>
            <Text
              style={{
                fontFamily: 'IBMPlexMono_400Regular',
                color: t.faint,
                fontSize: 10,
                marginBottom: 14,
              }}>
              Bitmap / dither lab — receipts & roster stamps.
            </Text>
            <PixelButton
              variant="outline"
              label="OPEN BITMAP LAB"
              onPress={() => router.push('/profile/bitmap-avatar')}
            />
          </ThermalCard>

        </View>
      </ScrollView>
    </View>
  );
}
