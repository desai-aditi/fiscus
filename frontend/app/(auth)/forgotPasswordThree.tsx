import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import React, { useRef } from 'react';
import { Link, router, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import BackButton from '@/components/BackButton';
import { scale, verticalScale } from '@/utils/styling';
import Input from '@/components/Input';
import Typo from '@/components/Typo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { colors } from '@/constants/theme';
import Button from '@/components/Button';
import { radius } from '@/constants/scaling';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { APIService } from '@/services/apiService';
import { useAuth } from '@/contexts/authContext';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';

export default function ForgotPasswordThree() {
  const {user} = useAuth();
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [password, setPassword] = useState(""); // Use useState instead of useRef
  
  useEffect(() => {
    const getResetToken = async () => {
      try {
        const token = await AsyncStorage.getItem('resetToken');
        setResetToken(token);
      } catch (error) {
        console.error('Failed to get reset token');
      }
    };
    getResetToken();
  }, []);

  const handleFaceId = async () => {
      const {success} = await LocalAuthentication.authenticateAsync();
      if (success){
        router.replace('/(tabs)/home')
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }
    }

  const handleSubmit = async () => {
    if (!resetToken || !password.trim()) {
      console.error('Missing token or password');
      return;
    }
    
    try {
      const result = await APIService.resetPassword(resetToken, password);
      if (result.success) {
        // Clean up the stored token
        await AsyncStorage.removeItem('resetToken');
        router.replace('/(tabs)/home')
      }
    } catch (error) {
      console.error('unable to reset password at this time', error);
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
          <Typo fontWeight={600} size={21}>Secure your account with a new password</Typo>
          <Typo size={14}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqu</Typo>
        </View>

        <View style={styles.formContainer}>
          <Input onChangeText={setPassword} secureTextEntry label='Set new password' icon={<FontAwesome name="lock" size={20} color={colors.neutral900}/>} placeholder='********'/>
          <Button style={{backgroundColor: colors.primary}} onPress={() => handleSubmit()}>
            <Typo color={colors.white} size={16}>Reset password</Typo>
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