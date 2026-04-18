import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  gender?: string;
  date_of_birth?: string;
  blood_group?: string;
  allergies?: string;
  phone?: string;
  weight_kg?: number;
}

interface AuthState {
  user: User | null;
  ready: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  ready: false,
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    const r = await authAPI.login(email, password);
    await AsyncStorage.setItem('access_token', r.data.access_token);
    await AsyncStorage.setItem('refresh_token', r.data.refresh_token);
    set({ user: r.data.user, loading: false });
  },

  register: async (data) => {
    set({ loading: true });
    const r = await authAPI.register(data);
    await AsyncStorage.setItem('access_token', r.data.access_token);
    await AsyncStorage.setItem('refresh_token', r.data.refresh_token);
    set({ user: r.data.user, loading: false });
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    set({ user: null });
  },

  hydrate: async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        const r = await authAPI.me();
        set({ user: r.data, ready: true });
      } else {
        set({ ready: true });
      }
    } catch {
      await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
      set({ user: null, ready: true });
    }
  },
}));
