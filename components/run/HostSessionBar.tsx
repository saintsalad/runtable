import * as Haptics from 'expo-haptics';
import { Share2, Users } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

type HostSessionBarProps = {
  iconMuted: string;
  onCloseSession: () => void;
  onViewParticipants: () => void;
  onShareRoom: () => void;
};

/** Bordered monochrome host utilities — terminal-control aesthetic. */
export const HostSessionBar = memo(function HostSessionBar({
  iconMuted,
  onCloseSession,
  onViewParticipants,
  onShareRoom,
}: HostSessionBarProps) {
  return (
    <View className="mt-4 border border-runtable-border bg-runtable-surface/80 px-3 py-3">
      <View className="mb-2 flex-row items-center gap-2 border-b border-runtable-border/60 pb-2">
        <View className="border border-runtable-muted px-1.5 py-0.5">
          <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold' }} className="text-[8px] uppercase tracking-[0.28em] text-runtable-muted">
            HOST
          </Text>
        </View>
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular' }} className="text-[9px] uppercase tracking-widest text-runtable-faint">
          SESSION · UTIL
        </Text>
      </View>
      <View className="flex-row gap-2">
        <Pressable
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onCloseSession();
          }}
          className="min-h-[48px] flex-1 items-center justify-center border border-runtable-border bg-runtable-bg px-1 active:opacity-80">
          <Text
            style={{ fontFamily: 'IBMPlexMono_600SemiBold' }}
            className="text-center text-[8px] uppercase tracking-[0.18em] text-runtable-text">
            CLOSE{'\n'}SESSION
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            void Haptics.selectionAsync();
            onViewParticipants();
          }}
          className="h-12 flex-1 items-center justify-center border border-runtable-border bg-runtable-bg active:opacity-80">
          <Users color={iconMuted} size={20} strokeWidth={1.3} />
          <Text
            style={{ fontFamily: 'IBMPlexMono_400Regular' }}
            className="mt-0.5 text-[7px] uppercase tracking-tighter text-runtable-faint">
            ROSTER
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            void Haptics.selectionAsync();
            onShareRoom();
          }}
          className="h-12 flex-1 items-center justify-center border border-runtable-border bg-runtable-bg active:opacity-80">
          <Share2 color={iconMuted} size={20} strokeWidth={1.3} />
          <Text
            style={{ fontFamily: 'IBMPlexMono_400Regular' }}
            className="mt-0.5 text-[7px] uppercase tracking-tighter text-runtable-faint">
            SHARE
          </Text>
        </Pressable>
      </View>
    </View>
  );
});
