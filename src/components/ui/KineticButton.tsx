import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../../constants/theme';

interface KineticButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const KineticButton: React.FC<KineticButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled,
}) => {
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.container, style, disabled && styles.disabled]}
        disabled={disabled}
      >
        <LinearGradient
          colors={THEME.colors.kineticGradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Text style={[styles.text, styles.primaryText, textStyle]}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        variant === 'outline' ? styles.outline : styles.secondary,
        style,
        disabled && styles.disabled,
      ]}
      disabled={disabled}
    >
      <Text
        style={[
          styles.text,
          variant === 'outline' ? styles.outlineText : styles.secondaryText,
          textStyle,
          disabled && styles.disabledText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.xl,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: THEME.colors.surfaceContainerHigh,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.xl,
  },
  outline: {
    borderWidth: 1,
    borderColor: THEME.colors.outlineVariant,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.xl,
  },
  text: {
    ...THEME.typography.label,
    textAlign: 'center',
  },
  primaryText: {
    color: THEME.colors.onPrimary,
  },
  secondaryText: {
    color: THEME.colors.onSurface,
  },
  outlineText: {
    color: THEME.colors.onSurfaceVariant,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.8,
  },
});

