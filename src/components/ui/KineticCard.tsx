import React from 'react';
import { View, ViewStyle } from 'react-native';

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
  const getVariantClass = () => {
    switch (variant) {
      case 'low': return 'bg-white shadow-sm';
      case 'highest': return 'bg-white shadow-lg border border-orange-50/20';
      default: return 'bg-white shadow-md border border-outline-variant/5';
    }
  };

  return (
    <View 
      className={`rounded-3xl overflow-hidden relative my-2 ${getVariantClass()}`}
      style={style}
    >
      {hasAccent && <View className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />}
      <View className="p-5">
        {children}
      </View>
    </View>
  );
};
