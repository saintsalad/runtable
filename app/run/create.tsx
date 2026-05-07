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
import { FREE_TIER_MAX_PARTICIPANTS, PRO_TIER_MAX_PARTICIPANTS } from '@/constants/runtable';
import { PaceSegmented } from '@/features/create/PaceSegmented';
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
  paceZone: z.enum(['easy', 'moderate', 'tempo', 'fast']),
});

type FormValues = z.infer<typeof schema>;

const POLY_IDS = ['bgc_loop', 'rizal_strip', 'makati_grid', 'diliman_oval'];

function polylineForName(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) | 0;
  return POLY_IDS[Math.abs(h) % POLY_IDS.length]!;
}

export default function CreateRunScreen() {
  const router = useRouter();
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
      paceZone: 'moderate',
    },
  });

  const onSubmit = handleSubmit((data) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const host: Participant = {
      id: authUser.id,
      name: authUser.displayName,
      avatarColor: colorForName(authUser.displayName),
      paceZone: data.paceZone as PaceZone,
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
      paceZone: data.paceZone as PaceZone,
      maxParticipants: data.maxParticipants,
      startLabel: data.startLabel,
      isPublic: data.isPublic,
    });
    router.push('/run/lobby');
  });

  return (
    <View className="flex-1 bg-runtable-bg">
      <Header title="RACE TERMINAL" />
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} className="flex-1 px-6 pb-24 pt-2">
        <Text style={{ fontFamily: 'PressStart2P_400Regular' }} className="text-[9px] text-runtable-faint">
          CONFIG SESSION
        </Text>
        <DottedDivider className="my-4" />

        <ThermalCard className="mt-2 p-4">
          <View className="mb-2 flex-row items-center gap-2">
            <Route color="#CFCFCF" size={18} strokeWidth={1.4} />
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[10px] uppercase tracking-[0.32em] text-runtable-muted">
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
                placeholderTextColor="#8B8B8B"
                style={{ fontFamily: 'IBMPlexMono_400Regular' }}
                className="mt-2 border border-runtable-border bg-black px-3 py-3 text-[13px] uppercase text-runtable-text"
              />
            )}
          />
          {errors.routeName ? (
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-2 text-[11px] text-runtable-muted">
              {errors.routeName.message}
            </Text>
          ) : null}

          <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mb-2 mt-5 text-[10px] uppercase tracking-[0.32em] text-runtable-muted">
            DISTANCE (KM)
          </Text>
          <Controller
            control={control}
            name="distanceKm"
            render={({ field }) => (
              <TextInput
                value={String(field.value)}
                onChangeText={(t) => field.onChange(t.replace(/[^0-9.]/g, ''))}
                keyboardType="decimal-pad"
                placeholder="5.21"
                placeholderTextColor="#8B8B8B"
                style={{ fontFamily: 'IBMPlexMono_400Regular' }}
                className="border border-runtable-border bg-black px-3 py-3 text-[13px] text-runtable-text"
              />
            )}
          />
          {errors.distanceKm ? (
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-2 text-[11px] text-runtable-muted">
              {errors.distanceKm.message}
            </Text>
          ) : null}
        </ThermalCard>

        <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="mb-3 mt-10 text-[10px] uppercase tracking-[0.32em] text-runtable-muted">
          PACE ZONE
        </Text>
        <Controller
          control={control}
          name="paceZone"
          render={({ field }) => <PaceSegmented value={field.value} onChange={field.onChange} />}
        />

        <ThermalCard className="mt-10 p-4">
          <View className="mb-4 flex-row gap-2">
            <View className="border border-white px-3 py-1">
              <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[9px] uppercase text-black">
                FREE · {FREE_TIER_MAX_PARTICIPANTS}
              </Text>
            </View>
            <View className="border border-runtable-border px-3 py-1 opacity-50">
              <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[9px] uppercase text-runtable-muted">
                PRO · {PRO_TIER_MAX_PARTICIPANTS}+
              </Text>
            </View>
          </View>
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mb-2 text-[10px] uppercase tracking-[0.28em] text-runtable-faint">
            MAX PACK (FREE LOCK)
          </Text>
          <Controller
            control={control}
            name="maxParticipants"
            render={({ field }) => (
              <TextInput
                value={String(field.value)}
                onChangeText={(t) => field.onChange(Number(t.replace(/\D/g, '') || 0))}
                keyboardType="number-pad"
                style={{ fontFamily: 'IBMPlexMono_400Regular' }}
                className="border border-runtable-border bg-black px-3 py-3 text-[13px] text-runtable-text"
              />
            )}
          />
          {errors.maxParticipants ? (
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-2 text-[11px] text-runtable-muted">
              {errors.maxParticipants.message}
            </Text>
          ) : null}

          <View className="mb-2 mt-6 flex-row items-center gap-2">
            <CalendarClock color="#8B8B8B" size={18} strokeWidth={1.4} />
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[10px] uppercase tracking-[0.28em] text-runtable-muted">
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
                placeholderTextColor="#8B8B8B"
                style={{ fontFamily: 'IBMPlexMono_400Regular' }}
                className="border border-runtable-border bg-black px-3 py-3 text-[13px] uppercase text-runtable-text"
              />
            )}
          />

          <View className="mt-6 flex-row items-center justify-between border-t border-runtable-border pt-4">
            <View className="flex-1 pr-4">
              <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[11px] uppercase text-runtable-text">
                PUBLIC TABLE
              </Text>
              <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="mt-1 text-[10px] text-runtable-faint">
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
                  className="border border-runtable-border px-3 py-2 active:opacity-80">
                  <Text
                    style={{ fontFamily: 'IBMPlexMono_600SemiBold' }}
                    className="text-[10px] uppercase text-runtable-muted">
                    {field.value ? 'ON' : 'OFF'}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </ThermalCard>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-runtable-border bg-runtable-bg px-6 pb-10 pt-4">
        <FloatingCTA label="COMMIT RUN" onPress={onSubmit} />
      </View>
    </View>
  );
}
