import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { CalendarClock, Route } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { FloatingCTA } from '@/components/FloatingCTA';
import { Header } from '@/components/ui/Header';
import { DottedDivider } from '@/components/ui/DottedDivider';
import { ThermalCard } from '@/components/ui/ThermalCard';
import { PixelButton } from '@/components/ui/PixelButton';
import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';
import { FREE_TIER_MAX_PARTICIPANTS, PRO_TIER_MAX_PARTICIPANTS } from '@/constants/runtable';
import { colorForName } from '@/mocks/fixtures';
import { useRunTableStore } from '@/store';
import type { PaceZone, Participant } from '@/types';
import { z } from 'zod';

const schema = z.object({
  routeName: z.string().min(2, 'NAME ROUTE'),
  distanceKm: z.preprocess(
    (v) => (typeof v === 'string' ? Number(v.replace(/[^0-9.]/g, '')) : Number(v)),
    z.number().min(3).max(50)
  ),
  maxParticipants: z.preprocess(
    (v) => (typeof v === 'string' ? Number(v.replace(/\D/g, '') || 0) : Number(v)),
    z.number().int().min(2).max(FREE_TIER_MAX_PARTICIPANTS)
  ),
  startLabel: z.string().min(2, 'SCHEDULE'),
  isPublic: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const POLY_IDS = ['bgc_loop', 'rizal_strip', 'makati_grid', 'diliman_oval'];

function polylineForName(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) | 0;
  return POLY_IDS[Math.abs(h) % POLY_IDS.length]!;
}

export default function CreateTab() {
  const router = useRouter();
  const t = useThemeTokens();
  const authUser = useRunTableStore((s) => s.authUser);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      routeName: 'QC NIGHT LOOP',
      distanceKm: 5.21,
      maxParticipants: FREE_TIER_MAX_PARTICIPANTS,
      startLabel: 'SAT · 8:00 PM',
      isPublic: true,
    },
  });

  const onSubmit = handleSubmit((data) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const host: Participant = {
      id: authUser.id,
      name: authUser.displayName,
      avatarColor: colorForName(authUser.displayName),
      paceZone: 'moderate' as PaceZone,
      isHost: true,
      isReady: true,
    };
    useRunTableStore.getState().seedNewRun({
      runId: `local-${Date.now()}`,
      routeName: data.routeName,
      distanceKm: data.distanceKm,
      maxParticipants: data.maxParticipants,
      host,
      polylineId: polylineForName(data.routeName),
    });
    useRunTableStore.getState().setDraftRun({
      routeName: data.routeName,
      distanceKm: data.distanceKm,
      paceZone: 'moderate' as PaceZone,
      maxParticipants: data.maxParticipants,
      startLabel: data.startLabel,
      isPublic: data.isPublic,
    });
    router.push('/run/lobby');
  });

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <Header hideBack title="RACE TERMINAL" />
      <ScrollView contentContainerStyle={{ paddingBottom: 140, paddingHorizontal: 24, paddingTop: 8 }}>
        <Text style={{ fontFamily: 'PressStart2P_400Regular', color: t.faint, fontSize: 9 }}>
          CONFIG SESSION
        </Text>
        <DottedDivider className="my-4" />

        {/* Route import */}
        <ThermalCard className="mb-4 p-4">
          <Text
            style={{
              fontFamily: 'IBMPlexMono_600SemiBold',
              color: t.muted,
              fontSize: 9,
              textTransform: 'uppercase',
              letterSpacing: 3,
              marginBottom: 12,
            }}>
            IMPORT ROUTE
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <PixelButton variant="outline" label="STRAVA" onPress={() => {}} />
            </View>
            <View style={{ flex: 1 }}>
              <PixelButton variant="outline" label="FILE / GPX" onPress={() => {}} />
            </View>
          </View>
        </ThermalCard>

        {/* Route name + distance */}
        <ThermalCard className="mb-4 p-4">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Route color={t.muted} size={18} strokeWidth={1.4} />
            <Text
              style={{
                fontFamily: 'IBMPlexMono_400Regular',
                color: t.muted,
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: 4,
              }}>
              ROUTE NAME
            </Text>
          </View>
          <Controller
            control={control}
            name="routeName"
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder="QC NIGHT LOOP"
                placeholderTextColor={t.faint}
                style={{
                  fontFamily: 'IBMPlexMono_400Regular',
                  color: t.text,
                  fontSize: 13,
                  textTransform: 'uppercase',
                  borderWidth: 1,
                  borderColor: t.border,
                  backgroundColor: t.background,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  marginTop: 8,
                }}
              />
            )}
          />
          {errors.routeName ? (
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.muted, fontSize: 11, marginTop: 8 }}>
              {errors.routeName.message}
            </Text>
          ) : null}

          <Text
            style={{
              fontFamily: 'IBMPlexMono_400Regular',
              color: t.muted,
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: 4,
              marginTop: 20,
              marginBottom: 8,
            }}>
            DISTANCE (KM)
          </Text>
          <Controller
            control={control}
            name="distanceKm"
            render={({ field }) => (
              <TextInput
                value={String(field.value)}
                onChangeText={(v) => field.onChange(v.replace(/[^0-9.]/g, ''))}
                keyboardType="decimal-pad"
                placeholder="5.21"
                placeholderTextColor={t.faint}
                style={{
                  fontFamily: 'IBMPlexMono_400Regular',
                  color: t.text,
                  fontSize: 13,
                  borderWidth: 1,
                  borderColor: t.border,
                  backgroundColor: t.background,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                }}
              />
            )}
          />
          {errors.distanceKm ? (
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.muted, fontSize: 11, marginTop: 8 }}>
              {errors.distanceKm.message}
            </Text>
          ) : null}
        </ThermalCard>

        {/* Max participants + schedule */}
        <ThermalCard className="p-4">
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            <View
              style={{
                borderWidth: 1,
                borderColor: t.text,
                backgroundColor: t.text,
                paddingHorizontal: 12,
                paddingVertical: 4,
              }}>
              <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.background, fontSize: 9, textTransform: 'uppercase' }}>
                FREE · {FREE_TIER_MAX_PARTICIPANTS}
              </Text>
            </View>
            <View style={{ borderWidth: 1, borderColor: t.border, paddingHorizontal: 12, paddingVertical: 4, opacity: 0.5 }}>
              <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.muted, fontSize: 9, textTransform: 'uppercase' }}>
                PRO · {PRO_TIER_MAX_PARTICIPANTS}+
              </Text>
            </View>
          </View>

          <Text
            style={{
              fontFamily: 'IBMPlexMono_400Regular',
              color: t.faint,
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: 3,
              marginBottom: 8,
            }}>
            MAX PACK (FREE LOCK)
          </Text>
          <Controller
            control={control}
            name="maxParticipants"
            render={({ field }) => (
              <TextInput
                value={String(field.value)}
                onChangeText={(v) => field.onChange(Number(v.replace(/\D/g, '') || 0))}
                keyboardType="number-pad"
                style={{
                  fontFamily: 'IBMPlexMono_400Regular',
                  color: t.text,
                  fontSize: 13,
                  borderWidth: 1,
                  borderColor: t.border,
                  backgroundColor: t.background,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                }}
              />
            )}
          />
          {errors.maxParticipants ? (
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.muted, fontSize: 11, marginTop: 8 }}>
              {errors.maxParticipants.message}
            </Text>
          ) : null}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 8 }}>
            <CalendarClock color={t.faint} size={18} strokeWidth={1.4} />
            <Text
              style={{
                fontFamily: 'IBMPlexMono_400Regular',
                color: t.muted,
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: 3,
              }}>
              START SCHEDULE
            </Text>
          </View>
          <Controller
            control={control}
            name="startLabel"
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder="SAT · 8:00 PM"
                placeholderTextColor={t.faint}
                style={{
                  fontFamily: 'IBMPlexMono_400Regular',
                  color: t.text,
                  fontSize: 13,
                  textTransform: 'uppercase',
                  borderWidth: 1,
                  borderColor: t.border,
                  backgroundColor: t.background,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                }}
              />
            )}
          />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTopWidth: 1,
              borderTopColor: t.border,
              marginTop: 24,
              paddingTop: 16,
            }}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.text, fontSize: 11, textTransform: 'uppercase' }}>
                PUBLIC TABLE
              </Text>
              <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, fontSize: 10, marginTop: 4 }}>
                NEARBY RUNNERS CAN REQUEST A SEAT
              </Text>
            </View>
            <Controller
              control={control}
              name="isPublic"
              render={({ field }) => (
                <Pressable
                  onPress={() => {
                    void Haptics.selectionAsync();
                    field.onChange(!field.value);
                  }}
                  style={({ pressed }) => ({
                    borderWidth: 1,
                    borderColor: t.border,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    opacity: pressed ? 0.7 : 1,
                  })}>
                  <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.muted, fontSize: 10, textTransform: 'uppercase' }}>
                    {field.value ? 'ON' : 'OFF'}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </ThermalCard>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTopWidth: 1,
          borderTopColor: t.border,
          backgroundColor: t.background,
          paddingHorizontal: 24,
          paddingBottom: 32,
          paddingTop: 16,
        }}>
        <FloatingCTA label="COMMIT RUN" onPress={onSubmit} />
      </View>
    </View>
  );
}
