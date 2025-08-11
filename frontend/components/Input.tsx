import { radius, spacingX, spacingY } from '@/constants/scaling';
import { InputProps } from '@/types/components';
import { scale, verticalScale } from '@/utils/styling';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Typo from './Typo';
import { colors } from '@/constants/theme';

export default function Input(props: InputProps) {
  return (
    <View style={styles.container}>
        <Typo size={14} color={colors.neutral800}>{props.label}</Typo>
        <View style={[styles.inputContainer, props.containerStyle && props.containerStyle]}>
            {props.icon && props.icon}
            <TextInput
                style={[styles.input, props.inputStyle]}
                placeholderTextColor={colors.neutral400}
                ref={props.inputRef && props.inputRef}
                {...props}
            />
        </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacingY._10,
    // marginVertical: verticalScale(10)
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius._30,
    borderCurve: 'continuous',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(17),
    gap: spacingX._15,
    backgroundColor: colors.white
  },
  input: {
    flex: 1,
    fontSize: verticalScale(14),
    color: colors.black,
  },
});