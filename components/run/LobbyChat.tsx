import * as Haptics from 'expo-haptics';
import { Send } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';

import { ParticipantAvatar } from '@/components/ParticipantAvatar';
import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';
import { colorForName } from '@/mocks/fixtures';

type ChatMessage = {
  id: string;
  author: string;
  text: string;
  isHost: boolean;
  isSelf: boolean;
  ts: string;
};

const SEED_MESSAGES: ChatMessage[] = [
  { id: 'm0', author: 'HOST', text: 'Meet at the corner near 7-Eleven. Look for the green flag.', isHost: true, isSelf: false, ts: '7:41 PM' },
  { id: 'm1', author: 'BIANCA S.', text: 'On my way! 5 mins out', isHost: false, isSelf: false, ts: '7:43 PM' },
  { id: 'm2', author: 'CARLO R.', text: 'Same, parking now', isHost: false, isSelf: false, ts: '7:44 PM' },
];

type ChatInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
};

function ChatInput({ value, onChangeText, onSend }: ChatInputProps) {
  const t = useThemeTokens();
  const canSend = value.trim().length > 0;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: t.border,
        backgroundColor: t.background,
      }}>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'flex-end',
          backgroundColor: t.card,
          borderWidth: 1,
          borderColor: canSend ? t.muted : t.border,
          borderRadius: 6,
          paddingHorizontal: 12,
          paddingVertical: 8,
          minHeight: 42,
        }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Message the pack…"
          placeholderTextColor={t.faint}
          multiline
          blurOnSubmit
          returnKeyType="send"
          onSubmitEditing={onSend}
          style={{
            flex: 1,
            fontFamily: 'IBMPlexMono_400Regular',
            color: t.text,
            fontSize: 13,
            maxHeight: 90,
            textAlignVertical: 'top',
            paddingTop: 2,
            paddingBottom: 2,
          }}
        />
      </View>
      <Pressable
        onPress={onSend}
        disabled={!canSend}
        style={{
          width: 42,
          height: 42,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
          backgroundColor: canSend ? t.text : 'transparent',
          borderWidth: 1,
          borderColor: canSend ? t.text : t.border,
          opacity: canSend ? 1 : 0.35,
        }}
        className="active:opacity-60">
        <Send color={canSend ? t.background : t.faint} size={16} strokeWidth={1.6} />
      </Pressable>
    </View>
  );
}

type LobbyChatProps = {
  hostName: string;
  displayName: string;
};

export function LobbyChat({ hostName, displayName }: LobbyChatProps) {
  const t = useThemeTokens();
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_MESSAGES);
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList>(null);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const msg: ChatMessage = {
      id: `m-${Date.now()}`,
      author: displayName.toUpperCase().split(' ')[0] ?? 'YOU',
      text,
      isHost: false,
      isSelf: true,
      ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, msg]);
    setDraft('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }, [draft, displayName]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={160}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, gap: 12 }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        renderItem={({ item }) => {
          if (item.isSelf) {
            return (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, fontSize: 8, marginBottom: 3, paddingHorizontal: 2 }}>
                  {item.ts}
                </Text>
                <View
                  style={{
                    maxWidth: '75%',
                    backgroundColor: t.surface,
                    borderWidth: 1,
                    borderColor: t.muted,
                    borderRadius: 6,
                    borderBottomRightRadius: 2,
                    paddingHorizontal: 12,
                    paddingVertical: 9,
                  }}>
                  <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.text, fontSize: 13, lineHeight: 19 }}>
                    {item.text}
                  </Text>
                </View>
              </View>
            );
          }

          return (
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
              <ParticipantAvatar
                name={item.author}
                color={colorForName(item.author)}
                size="sm"
                isHost={item.isHost}
              />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 3, paddingHorizontal: 2 }}>
                  <Text
                    style={{
                      fontFamily: 'IBMPlexMono_600SemiBold',
                      color: item.isHost ? t.text : t.muted,
                      fontSize: 9,
                      letterSpacing: 1.5,
                      textTransform: 'uppercase',
                    }}>
                    {item.author}{item.isHost ? ' · HOST' : ''}
                  </Text>
                  <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, fontSize: 8 }}>
                    {item.ts}
                  </Text>
                </View>
                <View
                  style={{
                    alignSelf: 'flex-start',
                    maxWidth: '90%',
                    backgroundColor: item.isHost ? t.backgroundElevated : t.card,
                    borderWidth: 1,
                    borderColor: t.border,
                    borderRadius: 6,
                    borderBottomLeftRadius: 2,
                    paddingHorizontal: 12,
                    paddingVertical: 9,
                  }}>
                  <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.text, fontSize: 13, lineHeight: 19 }}>
                    {item.text}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
      />
      <ChatInput value={draft} onChangeText={setDraft} onSend={send} />
    </KeyboardAvoidingView>
  );
}
