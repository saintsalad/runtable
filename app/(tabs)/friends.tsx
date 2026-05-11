import * as Haptics from 'expo-haptics';
import { UserPlus, Users, MapPin } from 'lucide-react-native';
import { FlatList, Pressable, Share, Text, View } from 'react-native';

import { NoiseOverlay } from '@/components/ui/NoiseOverlay';
import { Header } from '@/components/ui/Header';
import { DottedDivider } from '@/components/ui/DottedDivider';
import { ThermalCard } from '@/components/ui/ThermalCard';
import { PixelButton } from '@/components/ui/PixelButton';
import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';
import { useRunTableStore } from '@/store';
import { colorForName, mockFullName } from '@/mocks/fixtures';

type MockFriend = {
  id: string;
  name: string;
  avatarColor: string;
  lastActivity: string;
  isOnline: boolean;
};

const MOCK_FRIENDS: MockFriend[] = Array.from({ length: 8 }, (_, i) => {
  const name = mockFullName(i * 31 + 7);
  return {
    id: `friend-${i}`,
    name,
    avatarColor: colorForName(name),
    lastActivity:
      i === 0 ? 'RUNNING NOW' : i < 3 ? `${i + 1}H AGO · BGC LOOP` : `${i}D AGO · QC STRIP`,
    isOnline: i < 2,
  };
});

function FriendRow({
  friend,
  onInvite,
}: {
  friend: MockFriend;
  onInvite: (f: MockFriend) => void;
}) {
  const t = useThemeTokens();
  const initials = friend.name
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: t.border,
        gap: 14,
      }}>
      {/* Avatar */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: friend.avatarColor,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1.5,
          borderColor: friend.isOnline ? friend.avatarColor : t.border,
        }}>
        <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: '#fff', fontSize: 11 }}>
          {initials}
        </Text>
        {friend.isOnline && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: '#4CAF50',
              borderWidth: 1.5,
              borderColor: t.background,
            }}
          />
        )}
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: 'IBMPlexMono_600SemiBold',
            color: t.text,
            fontSize: 11,
            textTransform: 'uppercase',
          }}>
          {friend.name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 }}>
          {friend.isOnline && <MapPin color={t.muted} size={9} strokeWidth={1.4} />}
          <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, fontSize: 9 }}>
            {friend.lastActivity}
          </Text>
        </View>
      </View>

      {/* Invite */}
      <Pressable
        onPress={() => onInvite(friend)}
        style={({ pressed }) => ({
          borderWidth: 1,
          borderColor: t.border,
          paddingHorizontal: 10,
          paddingVertical: 6,
          opacity: pressed ? 0.6 : 1,
        })}>
        <Text
          style={{
            fontFamily: 'IBMPlexMono_600SemiBold',
            color: t.muted,
            fontSize: 8,
            textTransform: 'uppercase',
            letterSpacing: 1.5,
          }}>
          INVITE
        </Text>
      </Pressable>
    </View>
  );
}

export default function FriendsTab() {
  const t = useThemeTokens();
  const draftRun = useRunTableStore((s) => s.draftRun);

  const handleInvite = (friend: MockFriend) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void Share.share({
      message: draftRun
        ? `Hey ${friend.name.split(' ')[0]}! Join my run on RUNTABLE — ${draftRun.routeName} · ${draftRun.distanceKm}km`
        : `Join me on RUNTABLE for a run!`,
    });
  };

  const handleShareInvite = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    void Share.share({ message: 'Join me on RUNTABLE! 🏃 [invite link]' });
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <NoiseOverlay opacity={0.035} />
      <Header hideBack title="FRIENDS" />

      <FlatList
        data={MOCK_FRIENDS}
        keyExtractor={(f) => f.id}
        renderItem={({ item }) => <FriendRow friend={item} onInvite={handleInvite} />}
        ListHeaderComponent={
          <View>
            {/* Invite banner */}
            <View style={{ margin: 24, marginBottom: 8 }}>
              <ThermalCard className="p-4">
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 10,
                  }}>
                  <UserPlus color={t.muted} size={15} strokeWidth={1.4} />
                  <Text
                    style={{
                      fontFamily: 'IBMPlexMono_600SemiBold',
                      color: t.text,
                      fontSize: 10,
                      textTransform: 'uppercase',
                      letterSpacing: 2,
                    }}>
                    INVITE RUNNERS
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: 'IBMPlexMono_400Regular',
                    color: t.faint,
                    fontSize: 10,
                    marginBottom: 12,
                  }}>
                  Share your invite link to grow your pack.
                </Text>
                <PixelButton
                  variant="outline"
                  label="SHARE INVITE LINK"
                  onPress={handleShareInvite}
                />
              </ThermalCard>
            </View>

            {draftRun ? (
              <View style={{ marginHorizontal: 24, marginBottom: 16 }}>
                <ThermalCard className="p-4">
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: 0,
                      width: 3,
                      backgroundColor: t.text,
                      borderTopLeftRadius: 12,
                      borderBottomLeftRadius: 12,
                    }}
                  />
                  <View style={{ paddingLeft: 8 }}>
                    <Text
                      style={{
                        fontFamily: 'IBMPlexMono_400Regular',
                        color: t.faint,
                        fontSize: 9,
                        textTransform: 'uppercase',
                        letterSpacing: 3,
                      }}>
                      ACTIVE SESSION
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'IBMPlexMono_600SemiBold',
                        color: t.text,
                        fontSize: 11,
                        marginTop: 6,
                        textTransform: 'uppercase',
                      }}>
                      {draftRun.routeName} · {draftRun.distanceKm}KM
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'IBMPlexMono_400Regular',
                        color: t.faint,
                        fontSize: 9,
                        marginTop: 4,
                      }}>
                      TAP INVITE on any friend to add them to this run.
                    </Text>
                  </View>
                </ThermalCard>
              </View>
            ) : null}

            <View style={{ paddingHorizontal: 24, paddingBottom: 4 }}>
              <DottedDivider />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingTop: 14,
                  paddingBottom: 4,
                }}>
                <Users color={t.muted} size={13} strokeWidth={1.4} />
                <Text
                  style={{
                    fontFamily: 'IBMPlexMono_600SemiBold',
                    color: t.muted,
                    fontSize: 9,
                    textTransform: 'uppercase',
                    letterSpacing: 4,
                  }}>
                  YOUR PACK · {MOCK_FRIENDS.length}
                </Text>
              </View>
            </View>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 48 }}
      />
    </View>
  );
}
