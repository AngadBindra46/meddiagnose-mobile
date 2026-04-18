import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = __DEV__ ? 'http://localhost:8000' : 'https://api.meddiagnose.com';

const api = axios.create({ baseURL: BASE_URL, timeout: 30000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401) {
      const rt = await AsyncStorage.getItem('refresh_token');
      if (rt) {
        try {
          const r = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, { refresh_token: rt });
          await AsyncStorage.setItem('access_token', r.data.access_token);
          await AsyncStorage.setItem('refresh_token', r.data.refresh_token);
          error.config.headers.Authorization = `Bearer ${r.data.access_token}`;
          return api(error.config);
        } catch { await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']); }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) => api.post('/api/v1/auth/login', { email, password }),
  register: (data: any) => api.post('/api/v1/auth/register', data),
  me: () => api.get('/api/v1/auth/me'),
};

export const patientAPI = {
  list: (page = 1, search = '') => api.get('/api/v1/patients', { params: { page, search } }),
  get: (id: number) => api.get(`/api/v1/patients/${id}`),
  create: (data: any) => api.post('/api/v1/patients', data),
  update: (id: number, data: any) => api.put(`/api/v1/patients/${id}`, data),
  delete: (id: number) => api.delete(`/api/v1/patients/${id}`),
};

export const diagnosisAPI = {
  list: (params: any = {}) => api.get('/api/v1/diagnoses', { params }),
  get: (id: number) => api.get(`/api/v1/diagnoses/${id}`),
  create: (data: any) => api.post('/api/v1/diagnoses', data),
  analyze: (formData: FormData) => api.post('/api/v1/diagnoses/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  }),
  review: (id: number, data: any) => api.put(`/api/v1/diagnoses/${id}/review`, data),
};

export const batchAPI = {
  upload: (file: any, name: string, priority = 'normal') => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/api/v1/batches/upload', fd, {
      params: { batch_name: name, priority },
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
  },
  list: (params: any = {}) => api.get('/api/v1/batches', { params }),
  get: (id: number) => api.get(`/api/v1/batches/${id}`),
};

export const symptomAPI = {
  log: (data: { symptom: string; severity: number; notes?: string }) =>
    api.post('/api/v1/symptoms', data),
  list: (days = 7) => api.get('/api/v1/symptoms', { params: { days } }),
  summary: (days = 7) => api.get('/api/v1/symptoms/summary', { params: { days } }),
};

export const chatAPI = {
  send: (message: string, diagnosis_id?: number) =>
    api.post('/api/v1/chat', { message, diagnosis_id }),
  history: (diagnosis_id?: number, limit = 50) =>
    api.get('/api/v1/chat/history', { params: { diagnosis_id, limit } }),
};

export const uploadAPI = {
  multiple: (files: any[]) => {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    return api.post('/api/v1/uploads/multiple', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export interface WearableRecord {
  date: string;
  steps?: number;
  calories_burned?: number;
  active_minutes?: number;
  distance_km?: number;
  sleep_hours?: number;
  weight_kg?: number;
  heart_rate?: number;
  spo2?: number;
}

export const wearableAPI = {
  syncAppleHealth: (records: WearableRecord[], deviceName?: string) =>
    api.post('/api/v1/wearables/sync-apple-health', { records, device_name: deviceName || 'Apple Health' }),
};

export default api;
