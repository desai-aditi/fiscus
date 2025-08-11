import { Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import React, { useRef, useState } from 'react';
import { Link, router } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import BackButton from '@/components/BackButton';
import { scale, verticalScale } from '@/utils/styling';
import Typo from '@/components/Typo';
import Input from '@/components/Input';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import { colors } from '@/constants/theme';
import Button from '@/components/Button';
import { radius, spacingX, spacingY } from '@/constants/scaling';
import { useAuth } from '@/contexts/authContext';
import { APIService } from '@/services/apiService';
import { auth } from '@/config/firebase';

export default function Register() {
  const nameRef = useRef("");
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [isLoading, setIsLoading] = useState(false); 
  const { register: registerUser } = useAuth();
  
  const handleSubmit = async () => {
    if(!emailRef.current || !passwordRef.current || !nameRef.current) {
      Alert.alert('Sign Up', 'Please fill in all fields.');
      return;
    }
    
    setIsLoading(true);
    const res = await registerUser(emailRef.current, passwordRef.current, nameRef.current);

    if (res.success) {
      try {
        const user = auth.currentUser;
        const token = user ? await user.getIdToken() : null;
        await APIService.sendVerificationCode(token);  // wait for completion
      } catch (e: any) {
        Alert.alert('Error', e.message || 'Failed to send verification code.');
      }
    } else {
      Alert.alert('Sign Up', res.msg || 'Registration failed.');
    }
  };

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
          <Typo fontWeight={600} size={21}>Sign Up</Typo>
          <Typo size={14}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqu</Typo>
        </View>

        <View style={styles.formContainer}>
          <Input onChangeText={(value) => (nameRef.current = value)} label='Name' icon={<FontAwesome name="user-circle" size={20} color={colors.neutral900}/>} placeholder='Kylo Ren' />
          <Input autoCapitalize='none' onChangeText={(value) => (emailRef.current = value)} label='Email' icon={<Feather name="mail" size={20} color={colors.neutral900}/>} placeholder='kylo.ren@gmail.com' />
          <Input onChangeText={(value) => (passwordRef.current = value)} secureTextEntry label='Password' icon={<FontAwesome name="lock" size={20} color={colors.neutral900}/>} placeholder='********'/>

          <Button style={{backgroundColor: colors.primary}} onPress={() => handleSubmit()}>
            <Typo color={colors.white} size={16}>Create Account</Typo>
          </Button>

          {/* divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider}></View>
            <Typo style={styles.dividerText} size={14} color={colors.neutral800}>Or, continue with</Typo>
          </View>

          <View style={styles.signInOptionsContainer}>
            <TouchableOpacity style={styles.signInOption} onPress={() => handleGoogleSignIn()}>
              <FontAwesome name="google" size={22} color={colors.black} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.signInOption}>
              <FontAwesome name="apple" size={22} color={colors.black} />
            </TouchableOpacity>
          </View>
          <Link style={{ alignSelf: 'center'}} href="/(auth)/login">
            <Typo size={14}>
              Have an account? <Typo size={14} fontWeight="700">Login</Typo>
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
  dividerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    margin: verticalScale(13)
  },
  divider: {
    width: '100%',
    height: verticalScale(1),
    backgroundColor: colors.neutral800
  },
  dividerText: {
    position: 'absolute',
    paddingHorizontal: scale(10),
    backgroundColor: colors.neutral200
  },
  signInOptionsContainer: {
    flexDirection: 'row',
    gap: spacingX._10,
    alignSelf: 'center'
  },
  signInOption: {
    width: scale(48),
    height: scale(48),
    // padding: scale(10),
    backgroundColor: colors.white,
    borderRadius: scale(50),
    alignItems: 'center',
    justifyContent: 'center'
  }
});