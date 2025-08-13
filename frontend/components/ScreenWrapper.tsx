import { colors } from '@/constants/theme';
import { ScreenWrapperProps } from '@/types/components';
import { scale } from '@/utils/styling';
import React from 'react';
import { Dimensions, Platform, StatusBar, StatusBarStyle, View, ViewStyle, StyleSheet } from 'react-native';

const {height} = Dimensions.get('window');

export default function ScreenWrapper({
  style,
  barStyle = 'dark-content',
  children
}: ScreenWrapperProps) {
  let paddingTop = Platform.OS === 'ios' ? height * 0.06 : 50;

  return (
    <View
      style={[styles.wrapper, { paddingTop, paddingHorizontal: scale(36), ...(style as ViewStyle) }]}
    >
      <StatusBar barStyle={barStyle} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.surfaceBg
  }
})