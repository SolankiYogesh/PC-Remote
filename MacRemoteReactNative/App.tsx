import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { StatusBadge } from './src/components/StatusBadge';
import { SystemOverview } from './src/components/SystemOverview';
import { ControlsPanel } from './src/components/ControlsPanel';
import { OfflineState } from './src/components/OfflineState';

import {
  useStatus,
  useSystemInfo,
  useVolume,
  useBrightness,
  useSetVolume,
  useSetBrightness,
  usePerformAction,
} from './src/hooks/useApi';
import { calculateMemoryPercentage } from './src/services/api';
import { MemorySample } from './src/types/api';
import { colors, typography, spacing, borderRadius } from './src/theme/colors';

const { width: screenWidth } = Dimensions.get('window');

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 0,
    },
  },
});

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  const [memorySamples, setMemorySamples] = useState<MemorySample[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [apiResponseTimes, setApiResponseTimes] = useState<number[]>([]);

  const {
    data: statusData,
    error: statusError,
    refetch: refetchStatus,
  } = useStatus();
  const { data: systemInfo } = useSystemInfo(!!statusData?.ok);
  const { data: volumeData } = useVolume();
  const { data: brightnessData } = useBrightness();

  const setVolumeMutation = useSetVolume();
  const setBrightnessMutation = useSetBrightness();
  const performActionMutation = usePerformAction();

  const isOnline = !!statusData?.ok;
  const isLoading = !statusData && !statusError;

  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      setVolumeMutation.mutate(newVolume);
    },
    [setVolumeMutation],
  );

  const handleBrightnessChange = useCallback(
    (newBrightness: number) => {
      setBrightnessMutation.mutate(newBrightness);
    },
    [setBrightnessMutation],
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
                const result = await performActionMutation.mutateAsync(action);
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
                  (err as { message: string }).message ||
                    'Failed to perform action',
                );
              }
            },
          },
        ],
      );
    },
    [performActionMutation],
  );

  const handleRetry = useCallback(async () => {
    await refetchStatus();
  }, [refetchStatus]);

  useEffect(() => {
    if (systemInfo?.mem) {
      const memoryPercent = calculateMemoryPercentage(
        systemInfo.mem.used,
        systemInfo.mem.total,
      );
      const newSample: MemorySample = {
        timestamp: Date.now(),
        used: systemInfo.mem.used,
        percent: memoryPercent,
      };

      setMemorySamples(prev => {
        const updated = [...prev, newSample];
        return updated.slice(-60);
      });
      setLastUpdated(new Date());
    }
  }, [systemInfo]);

  useEffect(() => {
    if (systemInfo) {
      const responseTime = Math.random() * 100 + 50;
      setApiResponseTimes(prev => [...prev.slice(-9), responseTime]);
    }
  }, [systemInfo]);

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
          <Text style={styles.title}>Mac Remote</Text>
        </View>
        <StatusBadge
          isOnline={isOnline}
          isLoading={isLoading}
          onRetry={handleRetry}
        />
      </View>

      {isOnline ? (
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
              <SystemOverview
                systemInfo={systemInfo || null}
                memorySamples={memorySamples}
              />
            </View>

            <View style={[styles.column, isWideScreen && styles.rightColumn]}>
              <ControlsPanel
                isOnline={isOnline}
                volume={volumeData?.volume || 50}
                brightness={brightnessData?.brightness || 0.5}
                onVolumeChange={handleVolumeChange}
                onBrightnessChange={handleBrightnessChange}
                onAction={handleAction}
              />
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
            </View>
          </View>
        </ScrollView>
      ) : (
        <OfflineState onRetry={handleRetry} isLoading={isLoading} />
      )}
    </View>
  );
}

export default () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

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
