import { radius, spacingX, spacingY } from '@/constants/scaling';
import { BackButtonProps } from '@/types/components';
import { scale, verticalScale } from '@/utils/styling';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign'

export default function BackButton({
    color = 'primary',
    style,
    iconSize = 25,
}: BackButtonProps) {

  return (
    <>
        {router.canGoBack() && <TouchableOpacity onPress={() => router.back()} style={[styles.button, style]}>
            <AntDesign
                name = "arrowleft"
                size={verticalScale(iconSize)}
                className={`tx-${color}`}
            />
        </TouchableOpacity>}
    </>
    
  );
}
const styles = StyleSheet.create({
    button: {
        marginTop: spacingY._7,
        marginLeft: -(scale(10)),
        alignSelf: 'flex-start',
        borderRadius: radius._12,
        borderCurve: 'continuous',
    }
});