import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { Link, router } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import BackButton from '@/components/BackButton';
import { scale, verticalScale } from '@/utils/styling';
import Typo from '@/components/Typo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors } from '@/constants/theme';
import { radius, spacingX, spacingY } from '@/constants/scaling';
import { useAuth } from '@/contexts/authContext';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';

export default function ChooseAuthMethod() {

  const {setSecurityMethod} = useAuth();

  const onBiometricPress = async () => {
    setSecurityMethod('faceId');
    const {success} = await LocalAuthentication.authenticateAsync();
    if (success){
      router.replace('/(tabs)/home')
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }

  return (
    <ScreenWrapper style={{ paddingTop: verticalScale(75), paddingHorizontal: 0 }}>
      <BackButton style={{ marginLeft: scale(20)}}/>
      <View style={styles.container}>

        <View style={styles.header}>
          <Typo fontWeight={600} size={21}>How would you like to confirm login everytime?</Typo>
          <Typo size={14}>You’ll use this to securely login e ipsum dolor blah blah. </Typo>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.authOptionsContainer}>
            <TouchableOpacity style={styles.authOption}  onPress={() => onBiometricPress()}>
              <View style={styles.authOptionTitle}>
                <MaterialCommunityIcons name='face-man-shimmer' size={45} color={colors.black}/>
                <Typo size={20} fontWeight='700'>Face ID</Typo>
              </View>
              <Typo size={14}>Use your biometrics to confirm login</Typo>
            </TouchableOpacity>
            <TouchableOpacity style={styles.authOption} onPress={() => router.push('/(auth)/pin?mode=set')}>
              <View style={styles.authOptionTitle}>
                <MaterialCommunityIcons name='numeric' size={45} color={colors.black}/>
                <Typo size={20} fontWeight='700'>PIN</Typo>
              </View>
              <Typo size={14}>Enter a 4-digit pin to confirm login</Typo>
            </TouchableOpacity>
          </View>
          

        </View>

      </View>
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
  },
  authOptionsContainer: {
    gap: spacingY._20
  },
  authOption:{
    backgroundColor: colors.white,
    padding: scale(24),
    borderRadius: radius._10,
    gap: spacingY._10
  },
  authOptionTitle:{
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10)
  }
});