import { colors } from '@/constants/theme';
import { ScreenWrapperProps } from '@/types/components';
import { scale, verticalScale } from '@/utils/styling';
import React from 'react';
import { Dimensions, Platform, StatusBar, StatusBarStyle, View, ViewStyle, StyleSheet } from 'react-native';

const {height} = Dimensions.get('window');

export default function ModalWrapper({
  style,
  children
}: ScreenWrapperProps) {

  return (
    <View
      style={[styles.wrapper, { paddingHorizontal: scale(36), ...(style as ViewStyle) }]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingVertical: verticalScale(16),
    backgroundColor: colors.offwhite
  }
})