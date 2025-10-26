import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  AppState,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { StatusBadge } from './src/components/StatusBadge';
import { BatteryRow } from './src/components/BatteryRow';
import { ControlSlider } from './src/components/ControlSlider';
import { ActionButton } from './src/components/ActionButton';
import { MemoryGraph } from './src/components/MemoryGraph';

import {
  apiService,
  formatBytes,
  calculateMemoryPercentage,
} from './src/services/api';
import { SystemInfo, MemorySample, ApiError } from './src/types/api';
import { colors, typography, spacing, borderRadius } from './src/theme/colors';

const { width: screenWidth } = Dimensions.get('window');

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [volume, setVolume] = useState(50);
  const [brightness, setBrightness] = useState(0.5);
  const [memorySamples, setMemorySamples] = useState<MemorySample[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiResponseTimes, setApiResponseTimes] = useState<number[]>([]);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const volumeDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const brightnessDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const POLLING_INTERVAL = 2000;
  const RECONNECT_INTERVAL = 10000;

  const checkServerStatus = useCallback(async () => {
    try {
      const startTime = Date.now();
      await apiService.getStatus();
      const responseTime = Date.now() - startTime;

      setApiResponseTimes(prev => [...prev.slice(-9), responseTime]);
      setIsOnline(true);
      setError(null);
      return true;
    } catch (err) {
      setIsOnline(false);
      setError((err as ApiError).message || 'Server unreachable');
      return false;
    }
  }, []);

  const fetchSystemInfo = useCallback(async () => {
    if (!isOnline) return;

    try {
      const startTime = Date.now();
      const info = await apiService.getInfo();
      const responseTime = Date.now() - startTime;

      setApiResponseTimes(prev => [...prev.slice(-9), responseTime]);
      setSystemInfo(info);
      setLastUpdated(new Date());

      const memoryPercent = calculateMemoryPercentage(
        info.mem.used,
        info.mem.total,
      );
      const newSample: MemorySample = {
        timestamp: Date.now(),
        used: info.mem.used,
        percent: memoryPercent,
      };

      setMemorySamples(prev => {
        const updated = [...prev, newSample];
        return updated.slice(-60);
      });
    } catch (err) {
      console.error('Failed to fetch system info:', err);
      setError((err as ApiError).message || 'Failed to fetch system info');
    }
  }, [isOnline]);

  const fetchControls = useCallback(async () => {
    if (!isOnline) return;

    try {
      const [volumeResp, brightnessResp] = await Promise.all([
        apiService.getVolume(),
        apiService.getBrightness(),
      ]);

      setVolume(volumeResp.volume);
      setBrightness(brightnessResp.brightness);
    } catch (err) {
      console.error('Failed to fetch controls:', err);
    }
  }, [isOnline]);

  const initializeApp = useCallback(async () => {
    setIsLoading(true);
    const statusOk = await checkServerStatus();

    if (statusOk) {
      await Promise.all([fetchSystemInfo(), fetchControls()]);
    }

    setIsLoading(false);
  }, [checkServerStatus, fetchSystemInfo, fetchControls]);

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(() => {
      if (isOnline) {
        fetchSystemInfo();
      }
    }, POLLING_INTERVAL);
  }, [isOnline, fetchSystemInfo]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      setVolume(newVolume);

      if (volumeDebounceRef.current) {
        clearTimeout(volumeDebounceRef.current);
      }

      volumeDebounceRef.current = setTimeout(async () => {
        try {
          await apiService.setVolume(newVolume);
        } catch (err) {
          setError((err as ApiError).message || 'Failed to set volume');
          fetchControls();
        }
      }, 300);
    },
    [fetchControls],
  );

  const handleBrightnessChange = useCallback(
    (newBrightness: number) => {
      setBrightness(newBrightness);

      if (brightnessDebounceRef.current) {
        clearTimeout(brightnessDebounceRef.current);
      }

      brightnessDebounceRef.current = setTimeout(async () => {
        try {
          await apiService.setBrightness(newBrightness);
        } catch (err) {
          setError((err as ApiError).message || 'Failed to set brightness');
          fetchControls();
        }
      }, 300);
    },
    [fetchControls],
  );

  const handleAction = useCallback(
    async (action: 'sleep' | 'restart' | 'shutdown') => {
      const actionNames = {
        sleep: 'Sleep',
        restart: 'Restart',
        shutdown: 'Shutdown',
      };

      Alert.alert(
        `Confirm ${actionNames[action]}`,
        `Are you sure you want to ${action.toLowerCase()} your Mac?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            style: 'destructive',
            onPress: async () => {
              try {
                const result = await apiService.performAction(action);
                if (result.success) {
                  Alert.alert(
                    'Success',
                    `${actionNames[action]} command sent successfully`,
                  );
                } else {
                  Alert.alert('Error', result.error || 'Action failed');
                }
              } catch (err) {
                Alert.alert(
                  'Error',
                  (err as ApiError).message || 'Failed to perform action',
                );
              }
            },
          },
        ],
      );
    },
    [],
  );

  const handleRetry = useCallback(async () => {
    setIsLoading(true);
    await initializeApp();
  }, [initializeApp]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background') {
        stopPolling();
      } else if (nextAppState === 'active' && isOnline) {
        startPolling();
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, [isOnline, startPolling, stopPolling]);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  useEffect(() => {
    if (isOnline) {
      startPolling();
    } else {
      stopPolling();

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      reconnectTimeoutRef.current = setTimeout(() => {
        checkServerStatus();
      }, RECONNECT_INTERVAL);
    }

    return () => {
      stopPolling();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isOnline, startPolling, stopPolling, checkServerStatus]);

  useEffect(() => {
    return () => {
      stopPolling();
      if (volumeDebounceRef.current) clearTimeout(volumeDebounceRef.current);
      if (brightnessDebounceRef.current)
        clearTimeout(brightnessDebounceRef.current);
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
    };
  }, [stopPolling]);

  const averageResponseTime =
    apiResponseTimes.length > 0
      ? Math.round(
          apiResponseTimes.reduce((a, b) => a + b, 0) / apiResponseTimes.length,
        )
      : 0;

  const isWideScreen = screenWidth > 768;
  const contentPadding = Math.max(safeAreaInsets.top, spacing.lg);

  return (
    <View style={[styles.container, { paddingTop: contentPadding }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background.primary}
      />

      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Mac Remote Control</Text>
          <Text style={styles.subtitle}>Local host:5001</Text>
        </View>
        <StatusBadge
          isOnline={isOnline}
          isLoading={isLoading}
          onRetry={handleRetry}
        />
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.content,
            isWideScreen ? styles.wideLayout : styles.narrowLayout,
          ]}
        >
          <View style={[styles.column, isWideScreen && styles.leftColumn]}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>System Overview</Text>

              {systemInfo?.battery && (
                <View style={styles.section}>
                  <BatteryRow battery={systemInfo.battery} />
                </View>
              )}

              {systemInfo?.cpu && (
                <View style={styles.section}>
                  <View style={styles.cpuContainer}>
                    <Text style={styles.cpuLabel}>CPU Load</Text>
                    <View style={styles.cpuStats}>
                      <Text style={styles.cpuValue}>
                        {systemInfo.cpu.currentLoad.toFixed(1)}%
                      </Text>
                      <Text style={styles.cpuSubtext}>
                        Avg: {systemInfo.cpu.avgLoad.toFixed(1)}%
                      </Text>
                    </View>
                    <View style={styles.cpuBar}>
                      <View
                        style={[
                          styles.cpuFill,
                          { width: `${systemInfo.cpu.currentLoad}%` },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <MemoryGraph data={memorySamples} />
              </View>

              {systemInfo?.mem && (
                <View style={styles.section}>
                  <View style={styles.memoryDetails}>
                    <Text style={styles.memoryLabel}>Memory</Text>
                    <Text style={styles.memoryValue}>
                      {formatBytes(systemInfo.mem.used)} /{' '}
                      {formatBytes(systemInfo.mem.total)}
                    </Text>
                    <Text style={styles.memoryPercent}>
                      {calculateMemoryPercentage(
                        systemInfo.mem.used,
                        systemInfo.mem.total,
                      ).toFixed(1)}
                      % used
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          <View style={[styles.column, isWideScreen && styles.rightColumn]}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Controls</Text>

              <View style={styles.section}>
                <ControlSlider
                  label="Volume"
                  value={volume}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onValueChange={handleVolumeChange}
                  disabled={!isOnline}
                />
              </View>

              <View style={styles.section}>
                <ControlSlider
                  label="Brightness"
                  value={brightness}
                  min={0}
                  max={1}
                  step={0.1}
                  unit="%"
                  onValueChange={handleBrightnessChange}
                  disabled={!isOnline}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.actionsLabel}>System Actions</Text>
                <View style={styles.actionsRow}>
                  <ActionButton
                    type="sleep"
                    onPress={() => handleAction('sleep')}
                    disabled={!isOnline}
                  />
                  <ActionButton
                    type="restart"
                    onPress={() => handleAction('restart')}
                    disabled={!isOnline}
                  />
                  <ActionButton
                    type="shutdown"
                    onPress={() => handleAction('shutdown')}
                    disabled={!isOnline}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Text style={styles.footerText}>
              Last updated:{' '}
              {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
            </Text>
            <Text style={styles.footerText}>
              Avg response: {averageResponseTime}ms
            </Text>
            {error && (
              <Text style={[styles.footerText, styles.errorText]}>
                Error: {error}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.size['2xl'],
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
  },
  errorBanner: {
    backgroundColor: colors.accent.error,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: colors.text.primary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  wideLayout: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  narrowLayout: {
    gap: spacing.lg,
  },
  column: {
    flex: 1,
  },
  leftColumn: {
    flex: 0.6,
  },
  rightColumn: {
    flex: 0.4,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: colors.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardTitle: {
    fontSize: typography.size.xl,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  cpuContainer: {
    gap: spacing.sm,
  },
  cpuLabel: {
    fontSize: typography.size.base,
    color: colors.text.primary,
    fontWeight: typography.weight.medium,
  },
  cpuStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cpuValue: {
    fontSize: typography.size.lg,
    color: colors.accent.primary,
    fontWeight: typography.weight.semibold,
  },
  cpuSubtext: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
  },
  cpuBar: {
    height: 6,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  cpuFill: {
    height: '100%',
    backgroundColor: colors.accent.primary,
    borderRadius: borderRadius.sm,
  },
  memoryDetails: {
    gap: spacing.xs,
  },
  memoryLabel: {
    fontSize: typography.size.base,
    color: colors.text.primary,
    fontWeight: typography.weight.medium,
  },
  memoryValue: {
    fontSize: typography.size.lg,
    color: colors.accent.primary,
    fontWeight: typography.weight.semibold,
  },
  memoryPercent: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
  },
  actionsLabel: {
    fontSize: typography.size.base,
    color: colors.text.primary,
    fontWeight: typography.weight.medium,
    marginBottom: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  footerContent: {
    backgroundColor: colors.background.glass,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  footerText: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
});
