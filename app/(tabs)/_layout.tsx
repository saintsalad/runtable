import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import { Activity, Map, Plus, Users, User } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';

type TabBarItemProps = {
  label: string;
  focused: boolean;
  icon: React.ReactNode;
  isCenter?: boolean;
  onPress: () => void;
};

const TabBarItem = memo(function TabBarItem({
  label,
  focused,
  icon,
  isCenter,
  onPress,
}: TabBarItemProps) {
  const t = useThemeTokens();

  if (isCenter) {
    return (
      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        hitSlop={8}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 10,
        }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: t.text,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: t.text,
            shadowOpacity: 0.25,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 6,
          }}>
          <Plus color={t.background} size={20} strokeWidth={2} />
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }}
      hitSlop={8}>
      <View style={{ opacity: focused ? 1 : 0.4, alignItems: 'center', gap: 4 }}>
        {icon}
        <Text
          style={{
            fontFamily: 'IBMPlexMono_600SemiBold',
            color: focused ? t.text : t.muted,
            fontSize: 6.5,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}>
          {label}
        </Text>
      </View>
      {focused && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: '20%',
            right: '20%',
            height: 1,
            backgroundColor: t.text,
          }}
        />
      )}
    </Pressable>
  );
});

function CustomTabBar({
  state,
  descriptors,
  navigation,
}: {
  state: { index: number; routes: { key: string; name: string }[] };
  descriptors: Record<string, { options: { tabBarLabel?: string } }>;
  navigation: {
    emit: (e: {
      type: string;
      target: string;
      canPreventDefault?: boolean;
    }) => { defaultPrevented?: boolean };
    navigate: (name: string) => void;
  };
}) {
  const t = useThemeTokens();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: t.border,
        backgroundColor: t.backgroundElevated,
        paddingBottom: insets.bottom,
      }}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const label = descriptors[route.key]?.options.tabBarLabel ?? route.name;
        const isCenter = route.name === 'create';

        const iconColor = focused ? t.text : t.muted;
        const iconSize = 18;
        const stroke = 1.4;

        const icon =
          route.name === 'index' ? (
            <Map color={iconColor} size={iconSize} strokeWidth={stroke} />
          ) : route.name === 'activities' ? (
            <Activity color={iconColor} size={iconSize} strokeWidth={stroke} />
          ) : route.name === 'create' ? null : route.name === 'friends' ? (
            <Users color={iconColor} size={iconSize} strokeWidth={stroke} />
          ) : (
            <User color={iconColor} size={iconSize} strokeWidth={stroke} />
          );

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabBarItem
            key={route.key}
            label={typeof label === 'string' ? label : route.name}
            focused={focused}
            icon={icon}
            isCenter={isCenter}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...(props as Parameters<typeof CustomTabBar>[0])} />}
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ tabBarLabel: 'MAP' }} />
      <Tabs.Screen name="activities" options={{ tabBarLabel: 'ACTIVITY' }} />
      <Tabs.Screen name="create" options={{ tabBarLabel: 'CREATE' }} />
      <Tabs.Screen name="friends" options={{ tabBarLabel: 'FRIENDS' }} />
      <Tabs.Screen name="profile" options={{ tabBarLabel: 'PROFILE' }} />
    </Tabs>
  );
}
