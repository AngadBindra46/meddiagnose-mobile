import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../src/store/auth';

const DISCLAIMER_KEY = 'disclaimer_accepted';

export default function RootLayout() {
  const { user, ready, hydrate } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  useEffect(() => { hydrate(); }, []);

  useEffect(() => {
    AsyncStorage.getItem(DISCLAIMER_KEY).then((val) => {
      setDisclaimerAccepted(val === 'true');
      setDisclaimerChecked(true);
    });
  }, []);

  useEffect(() => {
    if (!ready || !disclaimerChecked) return;

    const inDisclaimer = segments[0] === 'disclaimer';
    const inAuth = segments[0] === '(auth)';

    if (!disclaimerAccepted && !inDisclaimer) {
      router.replace('/disclaimer');
    } else if (disclaimerAccepted && !user && !inAuth && !inDisclaimer) {
      router.replace('/(auth)/login');
    } else if (disclaimerAccepted && user && (inAuth || inDisclaimer)) {
      router.replace('/tabs');
    }
  }, [user, ready, segments, disclaimerChecked, disclaimerAccepted]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerStyle: { backgroundColor: '#1A73E8' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' } }}>
        <Stack.Screen name="disclaimer" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
        <Stack.Screen name="diagnosis/[id]" options={{ title: 'Diagnosis Results' }} />
        <Stack.Screen name="chat" options={{ title: 'AI Health Assistant' }} />
        <Stack.Screen name="privacy-policy" options={{ title: 'Privacy Policy' }} />
        <Stack.Screen name="terms-of-service" options={{ title: 'Terms of Service' }} />
      </Stack>
    </>
  );
}
