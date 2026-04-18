import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './locales/en.json';
import hi from './locales/hi.json';
import es from './locales/es.json';

export type Language = 'en' | 'hi' | 'es';

export const LANGUAGES: { code: Language; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
];

const translations: Record<Language, Record<string, string>> = { en, hi, es };

const LANG_KEY = 'app_language';
let currentLang: Language = 'en';
let isLoaded = false;

export async function loadLanguage(): Promise<Language> {
  if (isLoaded) return currentLang;
  const saved = await AsyncStorage.getItem(LANG_KEY);
  if (saved && (saved === 'en' || saved === 'hi' || saved === 'es')) {
    currentLang = saved as Language;
  }
  isLoaded = true;
  return currentLang;
}

export async function setLanguage(lang: Language): Promise<void> {
  currentLang = lang;
  await AsyncStorage.setItem(LANG_KEY, lang);
}

export function getLanguage(): Language {
  return currentLang;
}

export function t(key: string): string {
  return translations[currentLang]?.[key] || translations.en[key] || key;
}
