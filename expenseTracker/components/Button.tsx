import { colors, radius } from '@/constants/theme';
import { CustomButtonProps } from '@/types';
import { verticalScale } from '@/utils/styling';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Loading from './Loading';

export default function Button({
    style,
    onPress,
    loading = false,
    children
}: CustomButtonProps) {

    if (loading) {
        return (
            <View style={[styles.button, style, {backgroundColor: 'transparent'}]}>
                <Loading />
            </View>
        )
    }

  return <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
    {children}
  </TouchableOpacity>;
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius._17,
    borderCurve: 'continuous',
    height: verticalScale(45),
    justifyContent: 'center',
    alignItems: 'center',
  },
});