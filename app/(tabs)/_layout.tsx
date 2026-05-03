import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1C1C1E', borderTopColor: '#2C2C2E' },
        tabBarActiveTintColor: '#0A84FF',
        tabBarInactiveTintColor: '#636366',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Väder', tabBarIcon: ({ color }) => <TabIcon icon="🌬️" color={color} /> }}
      />
      <Tabs.Screen
        name="route"
        options={{ title: 'Rutt', tabBarIcon: ({ color }) => <TabIcon icon="🗺️" color={color} /> }}
      />
      <Tabs.Screen
        name="guide"
        options={{ title: 'Guide', tabBarIcon: ({ color }) => <TabIcon icon="📖" color={color} /> }}
      />
    </Tabs>
  );
}

function TabIcon({ icon }: { icon: string; color: string }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 20 }}>{icon}</Text>;
}
