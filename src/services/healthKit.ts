/**
 * Apple HealthKit integration for MedDiagnose.
 * Reads health data and syncs to backend fitness tracker.
 *
 * Requires: expo-dev-client + iOS build (npx expo run:ios)
 * HealthKit does not work in Expo Go.
 */

import { Platform } from 'react-native';

export interface HealthRecord {
  date: string; // YYYY-MM-DD
  steps?: number;
  calories_burned?: number;
  active_minutes?: number;
  distance_km?: number;
  sleep_hours?: number;
  weight_kg?: number;
  heart_rate?: number;
  spo2?: number;
}

export interface HealthKitStatus {
  available: boolean;
  authorized: boolean;
  error?: string;
}

// HealthKit type identifiers (string format used by the library)
const HK = {
  stepCount: 'HKQuantityTypeIdentifierStepCount',
  activeEnergyBurned: 'HKQuantityTypeIdentifierActiveEnergyBurned',
  distanceWalkingRunning: 'HKQuantityTypeIdentifierDistanceWalkingRunning',
  heartRate: 'HKQuantityTypeIdentifierHeartRate',
  oxygenSaturation: 'HKQuantityTypeIdentifierOxygenSaturation',
  bodyMass: 'HKQuantityTypeIdentifierBodyMass',
};
const HKCategory = {
  sleepAnalysis: 'HKCategoryTypeIdentifierSleepAnalysis',
};

let HealthKitModule: any = null;
try {
  if (Platform.OS === 'ios') {
    HealthKitModule = require('@kingstinct/react-native-healthkit');
  }
} catch {
  // HealthKit not available (Expo Go, Android, or not installed)
}

const HKMod = HealthKitModule || {};

export function isHealthKitAvailable(): boolean {
  return Platform.OS === 'ios' && HealthKitModule != null;
}

export async function requestHealthKitAuthorization(): Promise<HealthKitStatus> {
  if (!isHealthKitAvailable()) {
    return {
      available: false,
      authorized: false,
      error: Platform.OS === 'android' ? 'Apple Health is only available on iOS' : 'HealthKit requires a development build',
    };
  }

  try {
    const toRead = [
      HK.stepCount,
      HK.activeEnergyBurned,
      HK.distanceWalkingRunning,
      HK.heartRate,
      HK.oxygenSaturation,
      HK.bodyMass,
      HKCategory.sleepAnalysis,
    ];
    await HKMod.requestAuthorization?.({ toRead });
    return { available: true, authorized: true };
  } catch (e: any) {
    return {
      available: true,
      authorized: false,
      error: e?.message || 'Authorization failed',
    };
  }
}

export async function readHealthData(days: number = 30): Promise<HealthRecord[]> {
  if (!isHealthKitAvailable()) {
    return [];
  }

  const recordsByDate: Record<string, HealthRecord> = {};
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - days);

  const queryOpts = { from: start.toISOString(), to: now.toISOString() };
  const getSamples = (res: any) => (Array.isArray(res) ? res : res?.samples || []);

  try {
    // Steps
    const stepRes = await HKMod.queryQuantitySamples?.(HK.stepCount, queryOpts);
    for (const s of getSamples(stepRes)) {
      const d = s.startDate ? new Date(s.startDate).toISOString().slice(0, 10) : null;
      if (d) {
        if (!recordsByDate[d]) recordsByDate[d] = { date: d };
        recordsByDate[d].steps = (recordsByDate[d].steps || 0) + (s.quantity ?? 0);
      }
    }

    // Active energy (calories)
    const energyRes = await HKMod.queryQuantitySamples?.(HK.activeEnergyBurned, queryOpts);
    for (const s of getSamples(energyRes)) {
      const d = s.startDate ? new Date(s.startDate).toISOString().slice(0, 10) : null;
      if (d) {
        if (!recordsByDate[d]) recordsByDate[d] = { date: d };
        recordsByDate[d].calories_burned = (recordsByDate[d].calories_burned || 0) + (s.quantity ?? 0);
      }
    }

    // Distance (meters -> km)
    const distRes = await HKMod.queryQuantitySamples?.(HK.distanceWalkingRunning, queryOpts);
    for (const s of getSamples(distRes)) {
      const d = s.startDate ? new Date(s.startDate).toISOString().slice(0, 10) : null;
      if (d) {
        if (!recordsByDate[d]) recordsByDate[d] = { date: d };
        const meters = s.quantity ?? 0;
        recordsByDate[d].distance_km = (recordsByDate[d].distance_km || 0) + meters / 1000;
      }
    }

    // Heart rate (average for day)
    const hrRes = await HKMod.queryQuantitySamples?.(HK.heartRate, queryOpts);
    const hrByDate: Record<string, number[]> = {};
    for (const s of getSamples(hrRes)) {
      const d = s.startDate ? new Date(s.startDate).toISOString().slice(0, 10) : null;
      if (d && s.quantity != null) {
        if (!hrByDate[d]) hrByDate[d] = [];
        hrByDate[d].push(s.quantity);
      }
    }
    for (const [d, vals] of Object.entries(hrByDate)) {
      if (!recordsByDate[d]) recordsByDate[d] = { date: d };
      recordsByDate[d].heart_rate = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    }

    // SpO2
    const spo2Res = await HKMod.queryQuantitySamples?.(HK.oxygenSaturation, queryOpts);
    const spo2ByDate: Record<string, number[]> = {};
    for (const s of getSamples(spo2Res)) {
      const d = s.startDate ? new Date(s.startDate).toISOString().slice(0, 10) : null;
      if (d && s.quantity != null) {
        if (!spo2ByDate[d]) spo2ByDate[d] = [];
        spo2ByDate[d].push(s.quantity * 100); // HealthKit uses 0-1, we want %
      }
    }
    for (const [d, vals] of Object.entries(spo2ByDate)) {
      if (!recordsByDate[d]) recordsByDate[d] = { date: d };
      recordsByDate[d].spo2 = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    }

    // Weight
    const weightRes = await HKMod.queryQuantitySamples?.(HK.bodyMass, queryOpts);
    const weightByDate: Record<string, number> = {};
    for (const s of getSamples(weightRes).reverse()) {
      const d = s.startDate ? new Date(s.startDate).toISOString().slice(0, 10) : null;
      if (d && s.quantity != null && weightByDate[d] == null) {
        weightByDate[d] = s.quantity;
      }
    }
    for (const [d, w] of Object.entries(weightByDate)) {
      if (!recordsByDate[d]) recordsByDate[d] = { date: d };
      recordsByDate[d].weight_kg = w;
    }

    // Sleep (category samples)
    try {
      const sleepRes = await HKMod.queryCategorySamples?.(HKCategory.sleepAnalysis, queryOpts);
      const sleepByDate: Record<string, number> = {};
      for (const s of getSamples(sleepRes)) {
        const d = s.startDate ? new Date(s.startDate).toISOString().slice(0, 10) : null;
        if (d) {
          const duration = s.endDate && s.startDate
            ? (new Date(s.endDate).getTime() - new Date(s.startDate).getTime()) / (1000 * 60 * 60)
            : 0;
          // Only count "inBed" or "asleep" (value 1 or 2)
          if (s.value === 1 || s.value === 2) {
            sleepByDate[d] = (sleepByDate[d] || 0) + duration;
          }
        }
      }
      for (const [d, hrs] of Object.entries(sleepByDate)) {
        if (!recordsByDate[d]) recordsByDate[d] = { date: d };
        recordsByDate[d].sleep_hours = Math.round(hrs * 10) / 10;
      }
    } catch {
      // Sleep may not be authorized
    }

    return Object.values(recordsByDate).sort((a, b) => a.date.localeCompare(b.date));
  } catch (e: any) {
    console.warn('HealthKit read error:', e);
    return [];
  }
}
