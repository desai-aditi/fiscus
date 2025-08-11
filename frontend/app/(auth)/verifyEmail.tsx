import { Alert, StyleSheet, View, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState } from 'react';
import { Link, router } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import BackButton from '@/components/BackButton';
import { scale, verticalScale } from '@/utils/styling';
import Typo from '@/components/Typo';
import { colors } from '@/constants/theme';
import Button from '@/components/Button';
import { radius } from '@/constants/scaling';
import SegmentedInput from '@/components/SegmentedInput';
import * as Clipboard from 'expo-clipboard';
import { APIService } from '@/services/apiService';
import { useAuth } from '@/contexts/authContext';
import { auth } from '@/config/firebase';

export default function VerifyEmail() {
  const [code, setCode] = useState('');
  const {token} = useAuth();

  const handleSubmit = async () => {
    if(code.length !== 6) {
      Alert.alert('Verify email', 'Please enter the full code.');
      return;
    }

    try {
      const res = await APIService.verifyCode(token, code);

      if (res.success) {
        router.push('/(auth)/chooseAuthMethod');
      } else {
        Alert.alert('Sign Up', res.message || 'Verification failed.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Verification failed due to a network or server error.');
    }
  };

  const resendCode = async () => {
    try {
      await APIService.sendVerificationCode(token);  // wait for completion
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to send verification code.');
    }
  }

  return (
    <ScreenWrapper style={{ paddingTop: verticalScale(75), paddingHorizontal: 0 }}>
      <BackButton style={{ marginLeft: scale(20) }} />

      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Typo fontWeight={600} size={21}>Verify your account</Typo>
            <Typo size={14}>
              Please enter 5-digit verification code sent to your registered email.
            </Typo>
          </View>

          <View style={styles.formContainer}>
            <SegmentedInput length={6} value={code} onChange={setCode} />

            <Button style={{ backgroundColor: colors.primary }} onPress={(() => handleSubmit())}>
              <Typo color={colors.white} size={16}>Verify Email</Typo>
            </Button>

            <Button style={{ alignSelf: 'center' }} onPress={() => resendCode()}>
              <Typo size={14}>
                Didn't receive the code?{' '}
                <Typo size={14} fontWeight="700">Resend</Typo>
              </Typo>
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
    gap: verticalScale(8),
    justifyContent: 'center',
    flex: 1
  },
  formContainer: {
    paddingVertical: verticalScale(33),
    paddingHorizontal: scale(36),
    gap: verticalScale(15),
    backgroundColor: colors.neutral200,
    borderTopLeftRadius: radius._30,
    borderTopRightRadius: radius._30,
    marginTop: 'auto'
  }
});
