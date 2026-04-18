import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../src/store/auth';

const DISCLAIMER_KEY = 'disclaimer_accepted';

export default function Index() {
  const { user, ready } = useAuth();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(DISCLAIMER_KEY).then((val) => {
      setDisclaimerAccepted(val === 'true');
    });
  }, []);

  if (!ready || disclaimerAccepted === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
        <ActivityIndicator size="large" color="#1A73E8" />
      </View>
    );
  }

  if (!disclaimerAccepted) return <Redirect href="/disclaimer" />;
  if (user) return <Redirect href="/tabs" />;
  return <Redirect href="/(auth)/login" />;
}
