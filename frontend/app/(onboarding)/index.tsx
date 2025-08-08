import { StyleSheet, Text, View} from 'react-native';
import React from 'react';
import { Link } from 'expo-router';
import { verifyInstallation } from "nativewind";

export default function Onboarding() {
  // const nativewind = verifyInstallation();
  // console.log("nativewind: ", nativewind);

  return (
    <View>
      <Text className='text-xl font-bold text-blue-500'>Onboarding Page</Text>
      <Link href={"/(auth)/register"}>Get started</Link>
      <Link href={"/(auth)/login"}>Already have an account?</Link>
    </View>
  );
}