import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BatteryRow } from './BatteryRow';
import { MemoryGraph } from './MemoryGraph';
import { formatBytes, calculateMemoryPercentage } from '../services/api';
import { SystemInfo } from '../types/api';
import { colors, typography, spacing, borderRadius } from '../theme/colors';

type SystemOverviewProps = {
  systemInfo: SystemInfo | null;
  memorySamples: Array<{ timestamp: number; used: number; percent: number }>;
};

export const SystemOverview: React.FC<SystemOverviewProps> = ({
  systemInfo,
  memorySamples,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>System Overview</Text>

      {systemInfo?.battery && (
        <View style={styles.section}>
          <BatteryRow battery={systemInfo.battery} />
        </View>
      )}

      {systemInfo?.cpu && Object.keys(systemInfo?.cpu).length > 0 && (
        <View style={styles.section}>
          <View style={styles.cpuContainer}>
            <Text style={styles.cpuLabel}>CPU Load</Text>
            <View style={styles.cpuStats}>
              <Text style={styles.cpuValue}>
                {systemInfo.cpu.currentLoad.toFixed(1)}%
              </Text>
              <Text style={styles.cpuSubtext}>
                Avg: {systemInfo.cpu?.avgLoad?.toFixed(1)}%
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
  );
};

const styles = StyleSheet.create({
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
});
