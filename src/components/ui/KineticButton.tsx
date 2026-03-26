import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
        disabled={disabled}
        className={`rounded-md overflow-hidden min-h-[52px] justify-center items-center shadow-premium active:scale-95 transition-all ${disabled ? 'opacity-50' : ''}`}
        style={style}
      >
        <LinearGradient
          colors={['#904d00', '#ff8c00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-full h-full items-center justify-center px-8"
        >
          <Text className="text-white text-sm font-bold uppercase tracking-widest text-center" style={textStyle}>
            {title}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const isOutline = variant === 'outline';
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`rounded-md min-h-[52px] justify-center items-center px-8 active:scale-95 transition-all ${isOutline ? 'border border-outline-variant/20 bg-white' : 'bg-primary-fixed/40'} ${disabled ? 'opacity-50' : ''}`}
      style={style}
    >
      <Text 
        className={`text-sm font-bold uppercase tracking-widest text-center text-primary`}
        style={textStyle}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

