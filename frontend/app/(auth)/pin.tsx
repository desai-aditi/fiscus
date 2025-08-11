import { Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import BackButton from '@/components/BackButton';
import { scale, verticalScale } from '@/utils/styling';
import Typo from '@/components/Typo';
import { colors } from '@/constants/theme';
import { radius } from '@/constants/scaling';
import SegmentedInput from '@/components/SegmentedInput';
import Button from '@/components/Button';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/authContext';
import { APIService } from '@/services/apiService';

export default function PinScreen() {
  const [pin, setPin] = useState('');
  const { token, unlock, user } = useAuth();
  const params = useLocalSearchParams();
  
  // Determine mode: 'set' for setting PIN, 'enter' for entering PIN
  // You can pass this as a route param or determine it based on user state
  const mode = params.mode as 'set' | 'enter' || (user?.securityMethod === 'pin' ? 'enter' : 'set');

  const handleSubmit = async () => {
    if (pin.length !== 4) {
      Alert.alert(
        mode === 'set' ? 'Set PIN' : 'Enter PIN', 
        'Please enter a 4 digit pin.'
      );
      return;
    }

    try {
      let res;
      
      if (mode === 'set') {
        res = await APIService.setPin(token, pin);
      } else {
        res = await APIService.verifyPin(token, pin);
      }

      if (res.success) {
        if (mode === 'set') {
          // After setting PIN, user might need to enter it or go to next step
          // You can either unlock immediately or redirect to enter PIN
          unlock();
          router.push('/(tabs)/home');
        } else {
          // After verifying PIN, unlock the app
          unlock();
          router.push('/(tabs)/home');
        }
      } else {
        Alert.alert(
          mode === 'set' ? 'Set PIN' : 'Enter PIN', 
          res.message || `${mode === 'set' ? 'Setting' : 'Verifying'} PIN failed.`
        );
      }
    } catch (e: any) {
      Alert.alert(
        'Error', 
        e.message || `${mode === 'set' ? 'Setting' : 'Verifying'} PIN failed due to a network or server error.`
      );
    }
  };

  const getContent = () => {
    if (mode === 'set') {
      return {
        title: 'Set your 4-digit PIN',
        subtitle: "You'll use this to securely login e ipsum dolor blah blah.",
        buttonText: 'Set PIN'
      };
    } else {
      return {
        title: 'Enter your PIN',
        subtitle: 'Enter your 4-digit PIN to access your account.',
        buttonText: 'Unlock'
      };
    }
  };

  const content = getContent();

  return (
    <ScreenWrapper style={{ paddingTop: verticalScale(75), paddingHorizontal: 0 }}>
      {mode === 'set' && <BackButton style={{ marginLeft: scale(20) }} />}
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <Typo fontWeight={600} size={21}>{content.title}</Typo>
              <Typo size={14}>{content.subtitle}</Typo>
            </View>

            <View style={styles.formContainer}>
              <SegmentedInput
                length={4}
                value={pin}
                onChange={setPin}
                secureTextEntry
              />
              <Button 
                style={{ backgroundColor: colors.primary }} 
                onPress={handleSubmit}
              >
                <Typo color={colors.white} size={16}>{content.buttonText}</Typo>
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
    paddingVertical: verticalScale(64),
    paddingHorizontal: scale(36),
    flexDirection: 'column',
    gap: verticalScale(15),
    backgroundColor: colors.neutral200,
    borderTopLeftRadius: radius._30,
    borderTopRightRadius: radius._30,
    marginTop: 'auto'
  }
});