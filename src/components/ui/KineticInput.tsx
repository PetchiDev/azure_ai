import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { THEME } from '../../constants/theme';

interface KineticInputProps extends TextInputProps {
  label?: string;
  containerStyle?: ViewStyle;
}

export const KineticInput: React.FC<KineticInputProps> = ({
  label,
  containerStyle,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.input}
        placeholderTextColor={`${THEME.colors.outline}80`}
        {...props}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    marginBottom: THEME.spacing.md,
  },
  label: {
    ...THEME.typography.label,
    color: THEME.colors.onSurfaceVariant,
    marginBottom: THEME.spacing.xs,
  },
  input: {
    backgroundColor: THEME.colors.surfaceContainerLow,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    color: THEME.colors.onSurface,
    ...THEME.typography.body,
  },
});
