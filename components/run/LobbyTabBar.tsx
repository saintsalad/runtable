import * as Haptics from 'expo-haptics';
import { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';

export type LobbyTab = 'MEMBERS' | 'CHAT' | 'BOARD' | 'SESSION';

const BASE_TABS: { id: LobbyTab; label: string }[] = [
  { id: 'MEMBERS', label: 'PACK' },
  { id: 'CHAT', label: 'CHAT' },
  { id: 'BOARD', label: 'BOARD' },
];

const SESSION_TAB: { id: LobbyTab; label: string } = { id: 'SESSION', label: 'SESSION' };

type LobbyTabBarProps = {
  active: LobbyTab;
  onChange: (tab: LobbyTab) => void;
  showSessionTab?: boolean;
};

export const LobbyTabBar = memo(function LobbyTabBar({ active, onChange, showSessionTab }: LobbyTabBarProps) {
  const t = useThemeTokens();
  const tabs = showSessionTab ? [...BASE_TABS, SESSION_TAB] : BASE_TABS;

  const handlePress = useCallback((id: LobbyTab) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(id);
  }, [onChange]);

  return (
    <View
      style={{
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: t.border,
        backgroundColor: t.backgroundElevated,
      }}>
      {tabs.map((tab) => {
        const focused = tab.id === active;
        const isSession = tab.id === 'SESSION';
        return (
          <Pressable
            key={tab.id}
            onPress={() => handlePress(tab.id)}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 11, position: 'relative' }}
            className="active:opacity-70">
            <Text
              style={{
                fontFamily: 'IBMPlexMono_600SemiBold',
                fontSize: 8,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color: focused ? (isSession ? '#4ade80' : t.text) : isSession ? '#4ade8088' : t.faint,
              }}>
              {tab.label}
            </Text>
            {isSession && !focused ? (
              <View style={{ position: 'absolute', top: 8, right: '20%', width: 5, height: 5, borderRadius: 99, backgroundColor: '#4ade80' }} />
            ) : null}
            {focused ? (
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '15%',
                  right: '15%',
                  height: 1,
                  backgroundColor: isSession ? '#4ade80' : t.text,
                }}
              />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
});
