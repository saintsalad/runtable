import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { CalendarClock, Eye, EyeOff, Route } from 'lucide-react-native';
import { Controller, useForm, useWatch } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { FloatingCTA } from '@/components/FloatingCTA';
import { GlassCard } from '@/components/GlassCard';
import { FREE_TIER_MAX_PARTICIPANTS } from '@/constants/runtable';
import { PaceSegmented } from '@/features/create/PaceSegmented';
import { colorForName } from '@/mocks/fixtures';
import { useRunTableStore } from '@/store';
import type { PaceZone, Participant } from '@/types';

const schema = z.object({
  routeName: z.string().min(2, 'Give the crew a route name'),
  distanceKm: z.preprocess(
    (v) => (typeof v === 'string' ? Number(v.replace(/[^0-9.]/g, '')) : Number(v)),
    z.number().min(3, 'At least 3 km').max(50)
  ),
  maxParticipants: z.preprocess(
    (v) => (typeof v === 'string' ? Number(v.replace(/\D/g, '') || 0) : Number(v)),
    z.number().int().min(2).max(FREE_TIER_MAX_PARTICIPANTS)
  ),
  startLabel: z.string().min(2, 'When are you rolling?'),
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
      routeName: 'BGC Loop Glow',
      distanceKm: 5,
      maxParticipants: FREE_TIER_MAX_PARTICIPANTS,
      startLabel: 'Sat · 6:10 AM',
      isPublic: true,
      paceZone: 'moderate',
    },
  });

  const isPublicWatch = useWatch({ control, name: 'isPublic', defaultValue: true });

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
    <SafeAreaView className="flex-1 bg-runtable-bg" edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} className="px-6 pt-4">
        <Text className="text-3xl font-bold text-white">Create run</Text>
        <Text className="mt-2 text-runtable-muted">
          Shape the table — pacing is the invite filter.
        </Text>

        <GlassCard className="mt-6 p-4">
          <View className="mb-2 flex-row items-center gap-2">
            <Route color="#7CFF6B" size={18} />
            <Text className="text-xs font-semibold uppercase tracking-widest text-runtable-muted">
              Route
            </Text>
          </View>
          <Controller
            control={control}
            name="routeName"
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Route name"
                placeholderTextColor="#64748B"
                className="mt-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-base text-white"
              />
            )}
          />
          {errors.routeName ? (
            <Text className="mt-2 text-sm text-runtable-warning">{errors.routeName.message}</Text>
          ) : null}

          <Text className="mb-2 mt-5 text-xs font-semibold uppercase tracking-widest text-runtable-muted">
            Distance (km)
          </Text>
          <Controller
            control={control}
            name="distanceKm"
            render={({ field }) => (
              <TextInput
                value={String(field.value)}
                onChangeText={(t) => field.onChange(t.replace(/[^0-9.]/g, ''))}
                keyboardType="decimal-pad"
                placeholder="5"
                placeholderTextColor="#64748B"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-base text-white"
              />
            )}
          />
          {errors.distanceKm ? (
            <Text className="mt-2 text-sm text-runtable-warning">{errors.distanceKm.message}</Text>
          ) : null}
        </GlassCard>

        <Text className="mb-3 mt-8 text-lg font-semibold text-white">Pace zone</Text>
        <Controller
          control={control}
          name="paceZone"
          render={({ field }) => <PaceSegmented value={field.value} onChange={field.onChange} />}
        />

        <GlassCard className="mt-6 p-4">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-runtable-muted">
            Max participants (free tier {FREE_TIER_MAX_PARTICIPANTS})
          </Text>
          <Controller
            control={control}
            name="maxParticipants"
            render={({ field }) => (
              <TextInput
                value={String(field.value)}
                onChangeText={(t) => field.onChange(Number(t.replace(/\D/g, '') || 0))}
                keyboardType="number-pad"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-base text-white"
              />
            )}
          />
          {errors.maxParticipants ? (
            <Text className="mt-2 text-sm text-runtable-warning">
              {errors.maxParticipants.message}
            </Text>
          ) : null}

          <View className="mb-2 mt-5 flex-row items-center gap-2">
            <CalendarClock color="#94A3B8" size={18} />
            <Text className="text-xs font-semibold uppercase tracking-widest text-runtable-muted">
              Date / time
            </Text>
          </View>
          <Controller
            control={control}
            name="startLabel"
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Tomorrow · 5:45 PM"
                placeholderTextColor="#64748B"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-base text-white"
              />
            )}
          />

          <View className="mt-6 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 pr-4">
              {isPublicWatch ? (
                <Eye color="#7CFF6B" size={20} />
              ) : (
                <EyeOff color="#94A3B8" size={20} />
              )}
              <View className="flex-1">
                <Text className="font-semibold text-white">Public table</Text>
                <Text className="text-xs text-runtable-muted">Nearby runners can request a seat.</Text>
              </View>
            </View>
            <Controller
              control={control}
              name="isPublic"
              render={({ field }) => (
                <Switch
                  value={field.value}
                  onValueChange={field.onChange}
                  trackColor={{ false: '#334155', true: '#7CFF6B55' }}
                  thumbColor={field.value ? '#7CFF6B' : '#94A3B8'}
                />
              )}
            />
          </View>
        </GlassCard>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-white/5 bg-runtable-bg/95 px-6 pb-8 pt-4">
        <FloatingCTA label="Create Run" onPress={onSubmit} />
      </View>
    </SafeAreaView>
  );
}
