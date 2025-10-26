import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getStatus,
  getSystemInfo,
  getVolume,
  setVolume,
  getBrightness,
  setBrightness,
  performAction,
} from '../services/api';

export const useStatus = () => {
  return useQuery({
    queryKey: ['status'],
    queryFn: getStatus,
    refetchInterval: 10000,
    staleTime: 0,
    gcTime: 0,
  });
};

export const useSystemInfo = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['systemInfo'],
    queryFn: getSystemInfo,
    refetchInterval: enabled ? 2000 : false,
    staleTime: 0,
    gcTime: 0,
    enabled,
  });
};

export const useVolume = () => {
  return useQuery({
    queryKey: ['volume'],
    queryFn: getVolume,
    staleTime: 0,
    gcTime: 0,
  });
};

export const useSetVolume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setVolume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volume'] });
    },
  });
};

export const useBrightness = () => {
  return useQuery({
    queryKey: ['brightness'],
    queryFn: getBrightness,
    staleTime: 0,
    gcTime: 0,
  });
};

export const useSetBrightness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setBrightness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brightness'] });
    },
  });
};

export const usePerformAction = () => {
  return useMutation({
    mutationFn: performAction,
  });
};
