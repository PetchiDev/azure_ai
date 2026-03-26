import React from 'react';
import { View, Text, TextInput, ViewStyle, TextInputProps } from 'react-native';

interface KineticInputProps extends TextInputProps {
  label?: string;
  containerStyle?: ViewStyle;
}

export const KineticInput: React.FC<KineticInputProps> = ({
  label,
  containerStyle,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View className="mb-4" style={containerStyle}>
      {label && <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-1">{label}</Text>}
      <TextInput
        className={`bg-surface-container-highest rounded-md p-4 text-sm font-medium text-on-surface border-2 ${isFocused ? 'border-primary' : 'border-transparent'}`}
        placeholderTextColor="#56433480"
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
    </View>
  );
};
