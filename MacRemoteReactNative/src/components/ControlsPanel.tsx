import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ControlSlider } from './ControlSlider';
import { ActionButton } from './ActionButton';
import { colors, typography, spacing, borderRadius } from '../theme/colors';

type ControlsPanelProps = {
  isOnline: boolean;
  volume: number;
  brightness: number;
  onVolumeChange: (volume: number) => void;
  onBrightnessChange: (brightness: number) => void;
  onAction: (action: 'sleep' | 'restart' | 'shutdown') => void;
};

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  isOnline,
  volume,
  brightness,
  onVolumeChange,
  onBrightnessChange,
  onAction,
}) => {
  const handleAction = useCallback(
    (action: 'sleep' | 'restart' | 'shutdown') => {
      onAction(action);
    },
    [onAction],
  );

  return (
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
          onValueChange={onVolumeChange}
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
          onValueChange={onBrightnessChange}
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
});
