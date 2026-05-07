import { Tabs } from 'expo-router';
import { Footprints, Home, ScrollText, User } from 'lucide-react-native';

import { HapticTab } from '@/components/haptic-tab';
import { RUNTABLE_COLORS } from '@/constants/runtable';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: RUNTABLE_COLORS.bg },
        tabBarActiveTintColor: RUNTABLE_COLORS.accent,
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: RUNTABLE_COLORS.card,
          borderTopColor: 'rgba(148,163,184,0.12)',
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size ?? 22} />,
        }}
      />
      <Tabs.Screen
        name="runs"
        options={{
          title: 'Runs',
          tabBarIcon: ({ color, size }) => <Footprints color={color} size={size ?? 22} />,
        }}
      />
      <Tabs.Screen
        name="receipt"
        options={{
          title: 'Receipts',
          tabBarIcon: ({ color, size }) => <ScrollText color={color} size={size ?? 22} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size ?? 22} />,
        }}
      />
    </Tabs>
  );
}
