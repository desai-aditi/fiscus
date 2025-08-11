import { useAuth } from '@/contexts/authContext';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Link, router } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { scale, verticalScale } from '@/utils/styling';
import BackButton from '@/components/BackButton';
import Typo from '@/components/Typo';
import Input from '@/components/Input';
import Feather from '@expo/vector-icons/Feather';
import { colors } from '@/constants/theme';
import { radius, spacingX } from '@/constants/scaling';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Button from '@/components/Button';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login: loginUser, user } = useAuth();

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert('Login', 'Please fill in all fields.');
            return;
        }
        setIsLoading(true);
        const res = await loginUser(email, password);
        console.log("Login response:", res);
        setIsLoading(false);
        if (!res.success) {
            Alert.alert('Login', res.msg);
        }
    };
    return (
        <ScreenWrapper  style={{ paddingTop: verticalScale(75), paddingHorizontal: 0 }}>
            <BackButton style={{ marginLeft: scale(20)}}/>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={styles.container}>

                        <View style={styles.header}>
                            <Typo fontWeight={600} size={21}>Login</Typo>
                            <Typo size={14}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqu</Typo>
                        </View>

                        <View style={styles.formContainer}>
                            <Input label='Email' icon={<Feather name="mail" size={20} color={colors.neutral900}/>} onChangeText={(setEmail)} keyboardType='email-address' autoCapitalize='none' placeholder='kylo.ren@gmail.com' />
                            <Input onChangeText={setPassword} secureTextEntry label='Password' icon={<FontAwesome name="lock" size={20} color={colors.neutral900}/>} placeholder='********'/>
                            
                            <Link href={'/(auth)/forgotPasswordOne'} style={{alignSelf: 'flex-end'}}>
                                <Typo size={14} color={colors.neutral400}>Forgot password?</Typo>
                            </Link>

                            <Button style={{backgroundColor: colors.primary}} disabled={isLoading} onPress={handleSubmit}>
                                <Typo color={colors.white} size={16}>Log in</Typo>
                            </Button>
                            {/* divider */}
                            <View style={styles.dividerContainer}>
                                <View style={styles.divider}></View>
                                <Typo style={styles.dividerText} size={14} color={colors.neutral800}>Or, continue with</Typo>
                            </View>

                            <View style={styles.signInOptionsContainer}>
                                <View style={styles.signInOption}>
                                <FontAwesome name="google" size={22} color={colors.black} />
                                </View>
                                <View style={styles.signInOption}>
                                <FontAwesome name="apple" size={22} color={colors.black} />
                                </View>
                            </View>

                            <Link style={{ alignSelf: 'center'}} href="/(auth)/register">
                                <Typo size={14}>
                                    Don't have an account? <Typo size={14} fontWeight="700">Sign Up</Typo>
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