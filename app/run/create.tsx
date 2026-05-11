import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Route, Users, Globe, Lock, Minus, Plus, Upload } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { FloatingCTA } from '@/components/FloatingCTA';
import { Header } from '@/components/ui/Header';
import { DottedDivider } from '@/components/ui/DottedDivider';
import { ThermalCard } from '@/components/ui/ThermalCard';
import { FREE_TIER_MAX_PARTICIPANTS, PRO_TIER_MAX_PARTICIPANTS } from '@/constants/runtable';
import { DateTimePicker } from '@/features/create/DateTimePicker';
import { PaceSegmented } from '@/features/create/PaceSegmented';
import { RunTagPicker, type RunTag } from '@/features/create/RunTagPicker';
import { RunTypeSegmented, type RunType } from '@/features/create/RunTypeSegmented';
import { colorForName } from '@/mocks/fixtures';
import { useRunTableStore } from '@/store';
import type { PaceZone, Participant } from '@/types';
import { z } from 'zod';

const schema = z.object({
  runType: z.enum(['IRL', 'VIRTUAL']),
  routeName: z.string().min(2, 'NAME ROUTE'),
  distanceKm: z.preprocess(
    (v) => (typeof v === 'string' ? Number(v.replace(/[^0-9.]/g, '')) : Number(v)),
    z.number().min(1).max(100)
  ),
  maxParticipants: z.preprocess(
    (v) => (typeof v === 'string' ? Number(v.replace(/\D/g, '') || 0) : Number(v)),
    z.number().int().min(2).max(FREE_TIER_MAX_PARTICIPANTS)
  ),
  startDate: z.date(),
  visibility: z.enum(['PUBLIC', 'FRIENDS', 'INVITE']),
  paceZone: z.enum(['easy', 'moderate', 'tempo', 'fast']),
  tags: z.array(z.string()),
});

type FormValues = z.infer<typeof schema>;

const VISIBILITY_OPTIONS: { id: FormValues['visibility']; label: string; sub: string; Icon: typeof Globe }[] = [
  { id: 'PUBLIC', label: 'PUBLIC', sub: 'ANYONE NEARBY', Icon: Globe },
  { id: 'FRIENDS', label: 'FRIENDS', sub: 'CONNECTIONS ONLY', Icon: Users },
  { id: 'INVITE', label: 'INVITE', sub: 'LINK ONLY', Icon: Lock },
];

const POLY_IDS = ['bgc_loop', 'rizal_strip', 'makati_grid', 'diliman_oval'];

function polylineForName(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) | 0;
  return POLY_IDS[Math.abs(h) % POLY_IDS.length]!;
}

function formatStartLabel(d: Date): string {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const day = days[d.getDay()] ?? 'SAT';
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${day} · ${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', fontSize: 9, textTransform: 'uppercase', letterSpacing: 3, color: '#8B8B8B', marginBottom: 10 }}>
      {children}
    </Text>
  );
}

function nextSaturday(): Date {
  const d = new Date();
  const daysUntil = (6 - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntil);
  d.setHours(20, 0, 0, 0);
  return d;
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
      runType: 'IRL',
      routeName: 'QC NIGHT LOOP',
      distanceKm: 5.21,
      maxParticipants: FREE_TIER_MAX_PARTICIPANTS,
      startDate: nextSaturday(),
      visibility: 'PUBLIC',
      paceZone: 'moderate',
      tags: [],
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
      startLabel: formatStartLabel(data.startDate),
      isPublic: data.visibility === 'PUBLIC',
    });
    router.push('/run/lobby');
  });

  return (
    <View className="flex-1 bg-runtable-bg">
      <Header title="CREATE RUNTABLE" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="flex-1 px-6 pt-4">

        {/* Run type */}
        <SectionLabel>RUN TYPE</SectionLabel>
        <Controller
          control={control}
          name="runType"
          render={({ field }) => (
            <RunTypeSegmented value={field.value as RunType} onChange={field.onChange} />
          )}
        />

        <DottedDivider className="my-6" />

        {/* Route */}
        <SectionLabel>ROUTE & DISTANCE</SectionLabel>
        <ThermalCard className="p-4">
          <View style={{ gap: 16 }}>
            {/* Route name — top */}
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Route color="#CFCFCF" size={14} strokeWidth={1.4} />
                <Text style={{ fontFamily: 'IBMPlexMono_400Regular', fontSize: 9, textTransform: 'uppercase', letterSpacing: 3, color: '#8B8B8B' }}>
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
                    className="border border-runtable-border bg-black px-3 py-3 text-[13px] uppercase text-runtable-text"
                  />
                )}
              />
              {errors.routeName ? (
                <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: '#8B8B8B', fontSize: 10, marginTop: 4 }}>
                  {errors.routeName.message}
                </Text>
              ) : null}
            </View>

            {/* Distance */}
            <View>
              <Text style={{ fontFamily: 'IBMPlexMono_400Regular', fontSize: 9, textTransform: 'uppercase', letterSpacing: 3, color: '#8B8B8B', marginBottom: 8 }}>
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
            </View>

            {/* Import route — bottom */}
            <Pressable
              onPress={() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                borderWidth: 1,
                borderColor: '#333',
                borderStyle: 'dashed',
                borderRadius: 6,
                paddingVertical: 12,
              }}
              className="active:opacity-60">
              <Upload color="#8B8B8B" size={14} strokeWidth={1.4} />
              <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: '#8B8B8B', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2 }}>
                IMPORT ROUTE
              </Text>
            </Pressable>
          </View>
        </ThermalCard>

        <DottedDivider className="my-6" />

        {/* Pace */}
        <SectionLabel>PACE ZONE</SectionLabel>
        <Controller
          control={control}
          name="paceZone"
          render={({ field }) => <PaceSegmented value={field.value} onChange={field.onChange} />}
        />

        <DottedDivider className="my-6" />

        {/* Date & time */}
        <SectionLabel>DATE & START TIME</SectionLabel>
        <Controller
          control={control}
          name="startDate"
          render={({ field }) => (
            <DateTimePicker value={field.value} onChange={field.onChange} />
          )}
        />

        <DottedDivider className="my-6" />

        {/* Capacity & visibility */}
        <SectionLabel>CAPACITY & VISIBILITY</SectionLabel>
        <ThermalCard className="p-4">
          <View style={{ gap: 16 }}>
          <View>
            <View className="mb-2 flex-row gap-2">
              <View className="border border-white px-3 py-1">
                <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', fontSize: 8, textTransform: 'uppercase', color: '#000', backgroundColor: '#fff' }} className="bg-white text-black">
                  FREE · {FREE_TIER_MAX_PARTICIPANTS}
                </Text>
              </View>
              <View className="border border-runtable-border px-3 py-1 opacity-50">
                <Text style={{ fontFamily: 'IBMPlexMono_400Regular', fontSize: 8, textTransform: 'uppercase', color: '#8B8B8B' }}>
                  PRO · {PRO_TIER_MAX_PARTICIPANTS}+
                </Text>
              </View>
            </View>
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular', fontSize: 9, textTransform: 'uppercase', letterSpacing: 2, color: '#8B8B8B', marginBottom: 8 }}>
              MAX PACK
            </Text>
            <Controller
              control={control}
              name="maxParticipants"
              render={({ field }) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#333', borderRadius: 6, overflow: 'hidden' }}>
                  <Pressable
                    onPress={() => {
                      void Haptics.selectionAsync();
                      field.onChange(Math.max(2, field.value - 1));
                    }}
                    style={{ paddingHorizontal: 16, paddingVertical: 12, borderRightWidth: 1, borderRightColor: '#333' }}
                    className="active:opacity-60">
                    <Minus color="#8B8B8B" size={14} strokeWidth={1.6} />
                  </Pressable>
                  <Text style={{ flex: 1, fontFamily: 'IBMPlexMono_600SemiBold', color: '#CFCFCF', fontSize: 16, textAlign: 'center' }}>
                    {field.value}
                  </Text>
                  <Pressable
                    onPress={() => {
                      void Haptics.selectionAsync();
                      field.onChange(Math.min(FREE_TIER_MAX_PARTICIPANTS, field.value + 1));
                    }}
                    style={{ paddingHorizontal: 16, paddingVertical: 12, borderLeftWidth: 1, borderLeftColor: '#333' }}
                    className="active:opacity-60">
                    <Plus color="#8B8B8B" size={14} strokeWidth={1.6} />
                  </Pressable>
                </View>
              )}
            />
            {errors.maxParticipants ? (
              <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: '#8B8B8B', fontSize: 10, marginTop: 4 }}>
                {errors.maxParticipants.message}
              </Text>
            ) : null}
          </View>

          {/* Visibility */}
          <View>
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular', fontSize: 9, textTransform: 'uppercase', letterSpacing: 3, color: '#8B8B8B', marginBottom: 10 }}>
              VISIBILITY
            </Text>
            <Controller
              control={control}
              name="visibility"
              render={({ field }) => (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {VISIBILITY_OPTIONS.map(({ id, label, sub, Icon }) => {
                    const active = field.value === id;
                    return (
                      <Pressable
                        key={id}
                        onPress={() => {
                          void Haptics.selectionAsync();
                          field.onChange(id);
                        }}
                        style={{
                          flex: 1,
                          alignItems: 'center',
                          gap: 4,
                          paddingVertical: 10,
                          borderWidth: 1,
                          borderColor: active ? '#CFCFCF' : '#333',
                          backgroundColor: active ? '#1a1a1a' : '#0a0a0a',
                          borderRadius: 4,
                        }}
                        className="active:opacity-70">
                        <Icon color={active ? '#CFCFCF' : '#555'} size={14} strokeWidth={1.4} />
                        <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: active ? '#CFCFCF' : '#555', fontSize: 7, textTransform: 'uppercase', letterSpacing: 1 }}>
                          {label}
                        </Text>
                        <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: '#444', fontSize: 6, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>
                          {sub}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            />
          </View>
          </View>
        </ThermalCard>

        <DottedDivider className="my-6" />

        {/* Tags */}
        <SectionLabel>RUN TAGS (OPTIONAL)</SectionLabel>
        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <RunTagPicker selected={field.value as RunTag[]} onChange={field.onChange} />
          )}
        />

        <DottedDivider className="my-6" />

        <FloatingCTA label="CREATE →" onPress={onSubmit} />

      </ScrollView>
    </View>
  );
}
