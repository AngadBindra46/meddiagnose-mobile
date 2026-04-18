import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';

const REMINDERS_KEY = 'med_reminders';

export interface MedReminder {
  id: string;
  diagnosisId: number;
  medName: string;
  dosage: string;
  frequency: string;
  hour: number;
  minute: number;
  enabled: boolean;
  createdAt: string;
}

export async function getReminders(): Promise<MedReminder[]> {
  const raw = await AsyncStorage.getItem(REMINDERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveReminder(reminder: MedReminder): Promise<void> {
  const all = await getReminders();
  const idx = all.findIndex((r) => r.id === reminder.id);
  if (idx >= 0) all[idx] = reminder;
  else all.push(reminder);
  await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(all));
}

export async function removeReminder(id: string): Promise<void> {
  const all = await getReminders();
  const filtered = all.filter((r) => r.id !== id);
  await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(filtered));
}

export async function clearRemindersForDiagnosis(diagnosisId: number): Promise<void> {
  const all = await getReminders();
  const filtered = all.filter((r) => r.diagnosisId !== diagnosisId);
  await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(filtered));
}

export function generateReminderId(diagnosisId: number, medName: string, idx: number): string {
  return `rem_${diagnosisId}_${idx}_${Date.now()}`;
}

export async function scheduleNotificationsForMedications(
  diagnosisId: number,
  medications: Array<{ name: string; dosage: string; frequency: string }>,
): Promise<MedReminder[]> {
  const reminders: MedReminder[] = [];
  const defaultTimes = [
    { hour: 8, minute: 0 },
    { hour: 14, minute: 0 },
    { hour: 20, minute: 0 },
  ];

  for (let i = 0; i < medications.length; i++) {
    const med = medications[i];
    const freq = med.frequency.toLowerCase();
    let times = [defaultTimes[0]];

    if (freq.includes('twice') || freq.includes('two times') || freq.includes('2')) {
      times = [defaultTimes[0], defaultTimes[2]];
    } else if (freq.includes('three') || freq.includes('3') || freq.includes('thrice')) {
      times = defaultTimes;
    } else if (freq.includes('four') || freq.includes('4')) {
      times = [{ hour: 8, minute: 0 }, { hour: 12, minute: 0 }, { hour: 16, minute: 0 }, { hour: 20, minute: 0 }];
    } else if (freq.includes('bedtime') || freq.includes('night')) {
      times = [{ hour: 21, minute: 0 }];
    } else if (freq.includes('morning')) {
      times = [{ hour: 8, minute: 0 }];
    }

    for (let j = 0; j < times.length; j++) {
      const reminder: MedReminder = {
        id: generateReminderId(diagnosisId, med.name, i * 10 + j),
        diagnosisId,
        medName: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        hour: times[j].hour,
        minute: times[j].minute,
        enabled: true,
        createdAt: new Date().toISOString(),
      };
      await saveReminder(reminder);
      reminders.push(reminder);
    }
  }

  try {
    const Notifications = require('expo-notifications');
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Enable notifications to receive medication reminders.');
      return reminders;
    }

    for (const rem of reminders) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Time to take ${rem.medName}`,
          body: `${rem.dosage} — ${rem.frequency}`,
          data: { reminderId: rem.id, type: 'medication' },
          sound: true,
        },
        trigger: {
          type: 'daily',
          hour: rem.hour,
          minute: rem.minute,
        },
      });
    }
  } catch {
    // expo-notifications may not be installed yet; reminders are still saved locally
  }

  return reminders;
}
