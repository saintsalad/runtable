import * as Haptics from 'expo-haptics';
import { Megaphone, Plus, Send } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { ThermalCard } from '@/components/ui/ThermalCard';
import { DottedDivider } from '@/components/ui/DottedDivider';
import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';

type Announcement = {
  id: string;
  text: string;
  ts: string;
};

const SEED: Announcement[] = [
  {
    id: 'a0',
    text: 'Meetup point is the corner of 32nd and 5th Ave, beside the Starbucks. Green flag marker.',
    ts: '7:30 PM',
  },
  {
    id: 'a1',
    text: 'Pace target is 5:50/km. We regroup at the water stop at KM 2.5.',
    ts: '7:35 PM',
  },
];

type LobbyAnnouncementsProps = {
  isHost: boolean;
  hostName: string;
};

export function LobbyAnnouncements({ isHost, hostName }: LobbyAnnouncementsProps) {
  const t = useThemeTokens();
  const [announcements, setAnnouncements] = useState<Announcement[]>(SEED);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<TextInput>(null);

  const openCompose = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setComposing(true);
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  const post = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAnnouncements((prev) => [
      ...prev,
      {
        id: `a-${Date.now()}`,
        text,
        ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setDraft('');
    setComposing(false);
  }, [draft]);

  const cancel = useCallback(() => {
    setDraft('');
    setComposing(false);
  }, []);

  return (
    <View style={{ gap: 12 }}>
      {/* Host compose area */}
      {isHost ? (
        composing ? (
          <View
            style={{
              borderWidth: 1,
              borderColor: t.border,
              borderRadius: 10,
              backgroundColor: t.card,
              padding: 14,
              gap: 10,
            }}>
            <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.muted, fontSize: 9, letterSpacing: 3, textTransform: 'uppercase' }}>
              NEW POST
            </Text>
            <TextInput
              ref={inputRef}
              value={draft}
              onChangeText={setDraft}
              multiline
              numberOfLines={3}
              placeholder="Write something for the pack…"
              placeholderTextColor={t.faint}
              style={{
                fontFamily: 'IBMPlexMono_400Regular',
                color: t.text,
                fontSize: 13,
                backgroundColor: t.surface,
                borderColor: t.border,
                borderWidth: 1,
                borderRadius: 6,
                padding: 12,
                minHeight: 72,
                textAlignVertical: 'top',
              }}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                onPress={cancel}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: t.border,
                  borderRadius: 6,
                  paddingVertical: 10,
                  alignItems: 'center',
                }}
                className="active:opacity-60">
                <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.faint, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' }}>
                  CANCEL
                </Text>
              </Pressable>
              <Pressable
                onPress={post}
                disabled={!draft.trim()}
                style={{
                  flex: 2,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  borderWidth: 1,
                  borderColor: draft.trim() ? t.text : t.border,
                  borderRadius: 6,
                  paddingVertical: 10,
                  backgroundColor: draft.trim() ? t.text : 'transparent',
                  opacity: draft.trim() ? 1 : 0.4,
                }}
                className="active:opacity-60">
                <Send color={draft.trim() ? t.background : t.faint} size={12} strokeWidth={1.6} />
                <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: draft.trim() ? t.background : t.faint, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' }}>
                  POST
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={openCompose}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              borderWidth: 1,
              borderColor: t.border,
              borderStyle: 'dashed',
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 12,
              backgroundColor: t.card,
            }}
            className="active:opacity-70">
            <Plus color={t.muted} size={14} strokeWidth={1.6} />
            <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.muted, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' }}>
              ADD POST
            </Text>
          </Pressable>
        )
      ) : null}

      {/* Announcement list */}
      {announcements.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 32, gap: 8 }}>
          <Megaphone color={t.border} size={28} strokeWidth={1.2} />
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, fontSize: 10, textTransform: 'uppercase', letterSpacing: 2 }}>
            NO POSTS YET
          </Text>
        </View>
      ) : (
        announcements.map((a, i) => (
          <ThermalCard key={a.id} className="p-4">
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Megaphone color={t.muted} size={11} strokeWidth={1.6} />
                <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.muted, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' }}>
                  {hostName.toUpperCase().split(' ')[0]} · HOST
                </Text>
              </View>
              <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, fontSize: 9 }}>
                {a.ts}
              </Text>
            </View>
            <DottedDivider className="mb-3" />
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.text, fontSize: 13, lineHeight: 20 }}>
              {a.text}
            </Text>
            {i === announcements.length - 1 ? (
              <View style={{ marginTop: 10, flexDirection: 'row' }}>
                <View style={{ backgroundColor: t.text, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2 }}>
                  <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.background, fontSize: 7, letterSpacing: 1, textTransform: 'uppercase' }}>
                    LATEST
                  </Text>
                </View>
              </View>
            ) : null}
          </ThermalCard>
        ))
      )}
    </View>
  );
}
