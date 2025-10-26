import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, typography, spacing, borderRadius } from '../theme/colors';

type ControlSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onValueChange: (value: number) => void;
  onValueChangeComplete?: (value: number) => void;
  disabled?: boolean;
};

export const ControlSlider: React.FC<ControlSliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  unit = '',
  onValueChange,
  onValueChangeComplete,
  disabled = false,
}) => {
  const handleStepChange = (direction: 'increment' | 'decrement') => {
    const newValue =
      direction === 'increment'
        ? Math.min(max, value + step)
        : Math.max(min, value - step);

    onValueChange(newValue);
    onValueChangeComplete?.(newValue);
  };

  const formatValue = (val: number) => {
    if (unit === '%' && max === 1) {
      return Math.round(val * 100) + unit;
    }
    return val + unit;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{formatValue(value)}</Text>
      </View>

      <View style={styles.sliderContainer}>
        <TouchableOpacity
          style={[styles.stepButton, disabled && styles.disabled]}
          onPress={() => handleStepChange('decrement')}
          disabled={disabled}
          accessibilityLabel={`Decrease ${label}`}
          accessibilityHint={`Decrease ${label} by ${step}`}
        >
          <Text style={styles.stepButtonText}>-</Text>
        </TouchableOpacity>

        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          value={value}
          step={step}
          onValueChange={onValueChange}
          onSlidingComplete={onValueChangeComplete}
          disabled={disabled}
          minimumTrackTintColor={colors.accent.primary}
          maximumTrackTintColor={colors.background.tertiary}
          thumbTintColor={colors.accent.primary}
          accessibilityLabel={label}
          accessibilityHint={`Adjust ${label} from ${min} to ${max}`}
        />

        <TouchableOpacity
          style={[styles.stepButton, disabled && styles.disabled]}
          onPress={() => handleStepChange('increment')}
          disabled={disabled}
          accessibilityLabel={`Increase ${label}`}
          accessibilityHint={`Increase ${label} by ${step}`}
        >
          <Text style={styles.stepButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: typography.size.base,
    color: colors.text.primary,
    fontWeight: typography.weight.medium,
  },
  value: {
    fontSize: typography.size.base,
    color: colors.accent.primary,
    fontWeight: typography.weight.semibold,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  stepButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepButtonText: {
    fontSize: typography.size.lg,
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
  },
  disabled: {
    opacity: 0.5,
  },
});
