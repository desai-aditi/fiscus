import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import React from 'react';
import { Link, router } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import BackButton from '@/components/BackButton';
import { scale, verticalScale } from '@/utils/styling';
import Input from '@/components/Input';
import Typo from '@/components/Typo';
import Feather from '@expo/vector-icons/Feather';
import { colors } from '@/constants/theme';
import Button from '@/components/Button';
import { radius } from '@/constants/scaling';

export default function ForgotPasswordOne() {
  return (
    <ScreenWrapper style={{ paddingTop: verticalScale(75), paddingHorizontal: 0 }}>
      <BackButton style={{ marginLeft: scale(20)}}/>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
        <View style={styles.container}>

        <View style={styles.header}>
          <Typo fontWeight={600} size={21}>Use your email to reset your password</Typo>
          <Typo size={14}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqu</Typo>
        </View>

        <View style={styles.formContainer}>
          <Input label='Email' icon={<Feather name="mail" size={20} color={colors.neutral900}/>} placeholder='kylo.ren@gmail.com' />
          <Button style={{backgroundColor: colors.primary}} onPress={() => router.push('/(auth)/forgotPasswordTwo')}>
            <Typo color={colors.white} size={16}>Send recovery email</Typo>
          </Button>

        </View>

      </View>
      </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    paddingHorizontal: scale(36),
    justifyContent: 'center',
    flex: 1,
    gap: verticalScale(8)
  },
  formContainer: {
    paddingVertical: verticalScale(33),
    paddingHorizontal: scale(36),
    flexDirection: 'column',
    gap: verticalScale(15),
    backgroundColor: colors.neutral200,
    borderTopLeftRadius: radius._30,
    borderTopRightRadius: radius._30,
    marginTop: 'auto'
  },
});