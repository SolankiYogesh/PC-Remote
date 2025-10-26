import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme/colors';

type StatusBadgeProps = {
  isOnline: boolean;
  isLoading: boolean;
  onRetry?: () => void;
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  isOnline,
  isLoading,
  onRetry,
}) => {
  const getStatusColor = () => {
    if (isLoading) return colors.status.connecting;
    return isOnline ? colors.status.online : colors.status.offline;
  };

  const getStatusText = () => {
    if (isLoading) return 'Connecting...';
    return isOnline ? 'Online' : 'Offline';
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <View
          style={[styles.statusDot, { backgroundColor: getStatusColor() }]}
        />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      {!isOnline && !isLoading && onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          accessibilityLabel="Retry connection"
          accessibilityHint="Attempt to reconnect to the server"
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background.glass,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    fontWeight: typography.weight.medium,
  },
  retryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.accent.primary,
    borderRadius: borderRadius.full,
  },
  retryText: {
    fontSize: typography.size.sm,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
  },
});
