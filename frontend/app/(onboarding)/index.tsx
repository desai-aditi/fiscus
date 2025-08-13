import { Pressable, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import { Link, router } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingY } from '@/constants/scaling';
import { verticalScale } from '@/utils/styling';
import { colors } from '@/constants/theme';
import Button from '@/components/Button';

export default function Onboarding() {

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Typo size={20} color={colors.secondary} fontWeight={700}>Welcome to Fiscus</Typo>
        <Typo size={30} fontWeight={700} color={colors.primary} style={{textAlign: 'center'}}>Take control of your finances today.</Typo>
        
        {/* placeholder circle */}
        <View style={styles.circle}></View>

        <Button style={{backgroundColor: colors.primary}} onPress={() => router.push('/(auth)/register')}>
          <Typo size={16} color={colors.white}>Get Started</Typo>
        </Button>

        <Typo size={14} color={colors.neutral800}>
          <Link href={"/(auth)/login"}>Already have an account?</Link>
        </Typo>
      </View>

    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacingY._50,
    gap: spacingY._17
  },
  circle: {
    backgroundColor: colors.neutral300, 
    width: 300,
    height: 300,
    borderRadius: '100%'
  }
})