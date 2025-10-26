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
          primaryColor: colors.accent.secondary,
        };
      case 'restart':
        return {
          icon: '🔄',
          label: 'Restart',
          primaryColor: colors.accent.warning,
        };
      case 'shutdown':
        return {
          icon: '⏻',
          label: 'Shutdown',
          primaryColor: colors.accent.error,
        };
      default:
        return {
          icon: '❓',
          label: 'Unknown',
          primaryColor: colors.accent.primary,
        };
    }
  };

  const { icon, label, primaryColor } = getButtonConfig();

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        useNativeDriver: true,
        speed: 20,
      }),
      Animated.spring(opacityAnim, {
        toValue: 0.85,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
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
          { backgroundColor: primaryColor },
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
    minHeight: 80,
  },
  button: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    shadowColor: colors.shadow.medium,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    // Subtle gradient effect using overlay
    position: 'relative',
    overflow: 'hidden',
  },
  icon: {
    fontSize: typography.size['2xl'],
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  label: {
    fontSize: typography.size.sm,
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.4,
    shadowOpacity: 0.2,
  },
});
