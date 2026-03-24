import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { THEME } from '../../constants/theme';

interface GlassContainerProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: 'dark' | 'light' | 'default';
  style?: any;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  intensity = 20,
  tint = 'dark',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {Platform.OS !== 'web' ? (
        <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill}>
          <View style={styles.overlay} />
        </BlurView>
      ) : (
        <View style={[styles.webOverlay, { backgroundColor: THEME.colors.surfaceContainer + 'CC' }]} />
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: THEME.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: THEME.colors.surfaceContainer + '40', // 25% opacity
  },
  webOverlay: {
    ...StyleSheet.absoluteFillObject,
    backdropFilter: 'blur(20px)',
  },
});
