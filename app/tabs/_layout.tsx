import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#1A73E8',
      tabBarInactiveTintColor: '#9AA0A6',
      tabBarStyle: { height: 64, paddingBottom: 10, paddingTop: 6, borderTopColor: '#E8EAED' },
      headerStyle: { backgroundColor: '#1A73E8' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '700' },
    }}>
      <Tabs.Screen name="index" options={{
        title: 'Home',
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home" size={size} color={color} />,
        headerTitle: 'MedDiagnose',
      }} />
      <Tabs.Screen name="upload" options={{
        title: 'Upload',
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="file-document-edit" size={size} color={color} />,
        headerTitle: 'Upload Report',
      }} />
      <Tabs.Screen name="track" options={{
        title: 'Track',
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="chart-timeline-variant" size={size} color={color} />,
        headerTitle: 'Symptom Tracker',
      }} />
      <Tabs.Screen name="reports" options={{
        title: 'Reports',
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="clipboard-text-clock" size={size} color={color} />,
        headerTitle: 'My Reports',
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Profile',
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-circle" size={size} color={color} />,
        headerTitle: 'My Profile',
      }} />
    </Tabs>
  );
}
