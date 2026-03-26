import React from 'react';
import { View, Platform, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassContainerProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: 'dark' | 'light' | 'default';
  style?: ViewStyle;
  className?: string;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  intensity = 80,
  tint = 'light',
  style,
}) => {
  return (
    <View 
      className="rounded-3xl overflow-hidden bg-transparent"
      style={style}
    >
      {Platform.OS !== 'web' ? (
        <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill}>
          <View className="absolute inset-0 bg-white/40" />
        </BlurView>
      ) : (
        <View 
          className="absolute inset-0 bg-white/80" 
          style={{ backdropFilter: 'blur(24px)' } as any} 
        />
      )}
      {children}
    </View>
  );
};
