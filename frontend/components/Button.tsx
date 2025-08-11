import { colors } from '@/constants/theme';
import { radius, spacingY } from '@/constants/scaling';
import { CustomButtonProps } from '@/types/components';
import { verticalScale } from '@/utils/styling';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function Button({
    style,
    onPress,
    loading = false,
    children
}: CustomButtonProps) {

  return <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
    {children}
  </TouchableOpacity>;
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius._30,
    borderCurve: 'continuous',
    paddingVertical: spacingY._17,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});