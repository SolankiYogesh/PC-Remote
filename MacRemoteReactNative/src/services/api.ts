import {
  SystemInfo,
  StatusResp,
  ActionReq,
  SuccessResp,
  ActionResp,
  ApiError,
} from '../types/api';

import { Platform } from 'react-native';

const BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:5001' : 'http://localhost:5001';

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw { message: error.message } as ApiError;
    }
    throw { message: 'Unknown network error' } as ApiError;
  }
}

export const apiService = {
  getStatus: (): Promise<StatusResp> => apiCall<StatusResp>('/status'),

  getInfo: (): Promise<SystemInfo> => apiCall<SystemInfo>('/info'),

  getVolume: (): Promise<{ volume: number }> =>
    apiCall<{ volume: number }>('/volume'),
  setVolume: (volume: number): Promise<SuccessResp> =>
    apiCall<SuccessResp>('/volume', {
      method: 'POST',
      body: JSON.stringify({ volume }),
    }),

  getBrightness: (): Promise<{ brightness: number }> =>
    apiCall<{ brightness: number }>('/brightness'),
  setBrightness: (brightness: number): Promise<SuccessResp> =>
    apiCall<SuccessResp>('/brightness', {
      method: 'POST',
      body: JSON.stringify({ brightness }),
    }),

  performAction: (action: ActionReq['type']): Promise<ActionResp> =>
    apiCall<ActionResp>('/action', {
      method: 'POST',
      body: JSON.stringify({ type: action }),
    }),
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const calculateMemoryPercentage = (
  used: number,
  total: number,
): number => {
  return total > 0 ? (used / total) * 100 : 0;
};
