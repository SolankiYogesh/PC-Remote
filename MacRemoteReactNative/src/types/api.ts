// API Types based on the provided schema

export type BatteryInfo = {
  hasBattery: boolean;
  percent: number;
  charging: boolean;
};

export type CPUInfo = {
  avgLoad: number;
  currentLoad: number;
};

export type MemInfo = {
  total: number;
  free: number;
  used: number;
};

export type SystemInfo = {
  battery: BatteryInfo;
  cpu: CPUInfo;
  mem: MemInfo;
};

export type VolumeResp = {
  volume: number;
};

export type BrightnessResp = {
  brightness: number;
};

export type StatusResp = {
  ok: boolean;
  message: string;
};

export type ActionReq = {
  type: 'sleep' | 'restart' | 'shutdown';
};

export type ActionResp = {
  success: boolean;
  error?: string;
};

export type SuccessResp = {
  success: boolean;
};

// Memory sample for the graph
export type MemorySample = {
  timestamp: number;
  used: number;
  percent: number;
};

// API Error type
export type ApiError = {
  message: string;
  status?: number;
};
