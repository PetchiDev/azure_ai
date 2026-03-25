import React from 'react';
import { View, StyleSheet, Platform, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, BORDER_RADIUS } from '@/constants/theme';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  intensity = 20,
  tint = 'dark',
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, style]} {...props}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill}>
          <View style={styles.overlay}>{children}</View>
        </BlurView>
      ) : (
        <View style={[styles.androidBackground, { backgroundColor: COLORS.glass.bg }]}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : COLORS.glass.bg,
  },
  overlay: {
    flex: 1,
    padding: 16,
  },
  androidBackground: {
    flex: 1,
    padding: 16,
  },
});
