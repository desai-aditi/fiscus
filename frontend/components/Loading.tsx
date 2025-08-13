import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '@/constants/theme';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  style?: ViewStyle;
}

export default function Loading({
  size = 'large',
  color = colors.primary500,
  message,
  style
}: LoadingProps) {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
    color: colors.neutral700,
    textAlign: 'center'
  }
});