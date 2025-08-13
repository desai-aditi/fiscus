import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import React, { useState } from 'react';
import { Link, router, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import BackButton from '@/components/BackButton';
import { scale, verticalScale } from '@/utils/styling';
import Input from '@/components/Input';
import Typo from '@/components/Typo';
import Feather from '@expo/vector-icons/Feather';
import { colors } from '@/constants/theme';
import Button from '@/components/Button';
import { radius } from '@/constants/scaling';
import SegmentedInput from '@/components/SegmentedInput';
import { APIService } from '@/services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ForgotPasswordTwo() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  
  const handleSubmit = async () => {
    if (!email) {
      console.error('Email not provided');
      return;
    }
    
    try {
      const result = await APIService.verifyResetCode(email, code);
      if (result.success && result.resetToken) {
        // Store token securely instead of passing through URL
        await AsyncStorage.setItem('resetToken', result.resetToken);
        
        router.push('/(auth)/forgotPasswordThree');
      }
    } catch (error) {
      console.error('unable to reset password at this time');
    }
  }

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
          <Typo fontWeight={600} size={21}>Check your email for the verification code</Typo>
          <Typo size={14}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqu</Typo>
        </View>

        <View style={styles.formContainer}>
            <SegmentedInput length={6} value={code} onChange={setCode} />
          <Button style={{backgroundColor: colors.primary}} onPress={() => handleSubmit()}>
            <Typo color={colors.white} size={16}>Verify</Typo>
          </Button>

          <Link style={{ alignSelf: 'center' }} href="/(auth)/register">
            <Typo size={14}>
              Didn't receive the code?{' '}
              <Typo size={14} fontWeight="700">Resend</Typo>
            </Typo>
          </Link>
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