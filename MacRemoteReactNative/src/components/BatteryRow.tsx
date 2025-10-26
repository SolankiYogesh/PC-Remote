import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BatteryInfo } from '../types/api';
import { colors, typography, spacing, borderRadius } from '../theme/colors';

type BatteryRowProps = {
  battery: BatteryInfo;
};

export const BatteryRow: React.FC<BatteryRowProps> = ({ battery }) => {
  const getBatteryColor = () => {
    if (battery.percent <= 20) return colors.accent.error;
    if (battery.percent <= 50) return colors.accent.warning;
    return colors.accent.success;
  };

  const getBatteryIcon = () => {
    if (battery.charging) return '⚡';
    if (battery.percent <= 20) return '🪫';
    return '🔋';
  };

  if (!battery.hasBattery) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>🔌</Text>
        <View style={styles.content}>
          <Text style={styles.label}>No Battery</Text>
          <Text style={styles.description}>Desktop Mode</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{getBatteryIcon()}</Text>
      <View style={styles.content}>
        <Text style={styles.label}>{battery.percent}%</Text>
        <View style={styles.statusContainer}>
          {battery.charging && (
            <View style={styles.chargingBadge}>
              <Text style={styles.chargingText}>Charging</Text>
            </View>
          )}
          <View style={styles.batteryBar}>
            <View
              style={[
                styles.batteryFill,
                {
                  width: `${battery.percent}%`,
                  backgroundColor: getBatteryColor(),
                },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  icon: {
    fontSize: typography.size.xl,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: typography.size.lg,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chargingBadge: {
    backgroundColor: colors.accent.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  chargingText: {
    fontSize: typography.size.xs,
    color: colors.text.primary,
    fontWeight: typography.weight.medium,
  },
  batteryBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  batteryFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
});
