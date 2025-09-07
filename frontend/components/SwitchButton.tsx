import { radius } from '@/constants/scaling';
import { colors } from '@/constants/theme';
import { scale, verticalScale } from '@/utils/styling';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View, Text, Dimensions, Platform } from 'react-native';
import Typo from './Typo';

const { width } = Dimensions.get('window');

interface Props {
  leftLabel?: string;
  rightLabel?: string;
  isLeftButtonActive: boolean;
  onLeftTabClicked: () => void;
  onRightTabClicked: () => void;
}

export default function SwitchButton({
  leftLabel,
  rightLabel,
  isLeftButtonActive,
  onLeftTabClicked,
  onRightTabClicked,
}: Props) {
    const buttonTranslateX = useRef(new Animated.Value(0)).current;
    const [containerWidth, setContainerWidth] = React.useState(0);

  useEffect(() => {
    Animated.spring(buttonTranslateX, {
      toValue: isLeftButtonActive ? 0 : width * 0.41, // Adjust based on your container width
      useNativeDriver: false,
    }).start();
  }, [isLeftButtonActive]);


  return (
    <View
    style={switchStyles.toggleContainer}
    onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
    {/* Left Button */}
    <TouchableOpacity onPress={onLeftTabClicked} style={switchStyles.tabContainer}>
        <Typo size={14} style={[isLeftButtonActive && switchStyles.activeLabel]}>
        {leftLabel}
        </Typo>
    </TouchableOpacity>

    {/* Right Button */}
    <TouchableOpacity onPress={onRightTabClicked} style={switchStyles.tabContainer}>
        <Typo size={14} style={[!isLeftButtonActive && switchStyles.activeLabel]}>
        {rightLabel}
        </Typo>
    </TouchableOpacity>

    {/* Animated Indicator */}
    {containerWidth > 0 && (
        <Animated.View
        style={[
            switchStyles.animatedIndicator,
            {
            width: containerWidth / 2,
            transform: [{ translateX: buttonTranslateX }],
            },
        ]}
        />
    )}
    </View>
  );
}

const switchStyles = StyleSheet.create({
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral200, 
    position: 'relative',
    width: '100%',
    borderRadius: radius._20,
    alignSelf: 'center',
    height: verticalScale(40),
    overflow: 'hidden',
  },
  tabContainer: {
    width: '50%',
    flexDirection: 'column',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2, 
    borderRadius: radius._20
  },
  activeLabel: {
    fontWeight: 600
  },
  animatedIndicator: {
    position: 'absolute',
    backgroundColor: colors.secondary, 
    opacity: 0.14,
    borderRadius: radius._20,
    zIndex: 1, 
    height: verticalScale(40)
  },
});