import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme/colors';

type ActionButtonProps = {
  type: 'sleep' | 'restart' | 'shutdown';
  onPress: () => void;
  disabled?: boolean;
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  type,
  onPress,
  disabled = false,
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [opacityAnim] = useState(new Animated.Value(1));

  const getButtonConfig = () => {
    switch (type) {
      case 'sleep':
        return {
          icon: '🌙',
          label: 'Sleep',
          color: colors.accent.secondary,
        };
      case 'restart':
        return {
          icon: '🔄',
          label: 'Restart',
          color: colors.accent.warning,
        };
      case 'shutdown':
        return {
          icon: '⏻',
          label: 'Shutdown',
          color: colors.accent.error,
        };
      default:
        return {
          icon: '❓',
          label: 'Unknown',
          color: colors.accent.primary,
        };
    }
  };

  const { icon, label, color } = getButtonConfig();

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.spring(opacityAnim, {
        toValue: 0.8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(opacityAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    onPress();
    // Reset animations after press
    setTimeout(() => {
      scaleAnim.setValue(1);
      opacityAnim.setValue(1);
    }, 300);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: color },
          disabled && styles.disabled,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        accessibilityLabel={label}
        accessibilityHint={`Perform ${label} action on the Mac`}
        accessibilityRole="button"
      >
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    shadowColor: colors.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    fontSize: typography.size.xl,
  },
  label: {
    fontSize: typography.size.base,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
  },
  disabled: {
    opacity: 0.5,
  },
});
