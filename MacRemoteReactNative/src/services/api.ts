import axios, { AxiosRequestConfig } from 'axios';
import {
  SystemInfo,
  StatusResp,
  ActionReq,
  SuccessResp,
  ActionResp,
  ApiError,
} from '../types/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

let BASE_URL: string | null = null;

export const setBaseUrl = async (newBaseUrl: string) => {
  BASE_URL = newBaseUrl;

  await AsyncStorage.setItem('serverIp', newBaseUrl);
};

export const getBaseUrl = async () => {
  const baseUrl = await AsyncStorage.getItem('serverIp');

  BASE_URL = baseUrl;
  return baseUrl;
};

export const clearStoredIp = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('serverIp');
  } catch (error) {
    console.error('Failed to clear stored IP:', error);
  }
};

async function apiCall<T>(
  endpoint: string,
  options: AxiosRequestConfig = {},
): Promise<T> {
  if (!BASE_URL) throw { message: 'BASE_URL is not set' } as ApiError;

  try {
    const response = await axios.request<T>({
      url: `${BASE_URL}${endpoint}`,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      data: options.data,
      params: options.params,
      ...options,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[API ERROR] Axios Error:', {
        message: error.message,
        url: `${BASE_URL}${endpoint}`,
        method: options.method || 'GET',
        status: error.response?.status,
        responseData: error.response?.data,
        headers: error.config?.headers,
      });
      throw {
        message: error.response?.data?.message || error.message,
      } as ApiError;
    }

    console.error('[API ERROR] Unknown Error:', error);
    throw { message: 'Unknown network error' } as ApiError;
  }
}

export const getStatus = (): Promise<StatusResp> =>
  apiCall<StatusResp>('/status');

export const getSystemInfo = (): Promise<SystemInfo> =>
  apiCall<SystemInfo>('/info');

export const getVolume = (): Promise<{ volume: number }> =>
  apiCall<{ volume: number }>('/volume');

export const setVolume = (volume: number): Promise<SuccessResp> =>
  apiCall<SuccessResp>('/volume', {
    method: 'POST',
    data: { volume },
  });

export const getBrightness = (): Promise<{ brightness: number }> =>
  apiCall<{ brightness: number }>('/brightness');

export const setBrightness = (brightness: number): Promise<SuccessResp> =>
  apiCall<SuccessResp>('/brightness', {
    method: 'POST',
    data: { brightness }, // changed from 'body' to 'data'
  });

export const performAction = (action: ActionReq['type']): Promise<ActionResp> =>
  apiCall<ActionResp>('/action', {
    method: 'POST',
    data: { type: action },
  });

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
