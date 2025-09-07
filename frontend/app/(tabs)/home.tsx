import { Dimensions, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useAuth } from '@/contexts/authContext';
import { SymbolView } from 'expo-symbols';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { scale, verticalScale } from '@/utils/styling';
import { colors } from '@/constants/theme';
import { Link, router } from 'expo-router';

const {height} = Dimensions.get('window');

export default function Home() {
  const {logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      logout();
      router.replace('/(onboarding)')
    } catch (error) {
      console.error('error logging out')
    }
  }

  return (
    <ScreenWrapper barStyle='light-content' style={{paddingTop: 0, paddingHorizontal: 0}}>
      <View style={[{paddingTop: Platform.OS === 'ios' ? height * 0.08 : 50}, styles.headerContainer]}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Typo color={colors.white} fontWeight={'bold'} size={22}>Good morning, {user.name} </Typo>
          <SymbolView name='bell.fill' tintColor={colors.white} />
        </View>

        <View style={{gap: scale(8)}}>
          <Typo color={colors.white} style={{textTransform: 'uppercase'}} size={12}>Total Balance</Typo>
          <Typo color={colors.white} fontWeight={'bold'} size={28}>$14,523.02</Typo>
        </View>

        <TouchableOpacity onPress={handleLogout}>
          <Typo>Logout</Typo>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: scale(28),
    flexDirection: 'column',
    gap: scale(30),
    backgroundColor: colors.primary,
    paddingBottom: verticalScale(28)
  }
});