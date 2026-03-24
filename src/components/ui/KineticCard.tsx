import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { THEME } from '../../constants/theme';

interface KineticCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'low' | 'high' | 'highest';
  hasAccent?: boolean;
}

export const KineticCard: React.FC<KineticCardProps> = ({
  children,
  style,
  variant = 'high',
  hasAccent = false,
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'low': return THEME.colors.surfaceContainerLow;
      case 'highest': return THEME.colors.surfaceContainerHighest;
      default: return THEME.colors.surfaceContainerHigh;
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: getBackgroundColor() }, style]}>
      {hasAccent && <View style={styles.accent} />}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: THEME.spacing.sm,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: THEME.colors.primary,
  },
  content: {
    padding: THEME.spacing.md,
  },
});
