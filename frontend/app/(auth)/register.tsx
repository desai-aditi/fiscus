import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';

export default function Register() {
  return (
    <View>
      <Text>Register Page</Text>
      <Link href="/(auth)/verifyEmail">Verify Email</Link>
    </View>
  );
}
const styles = StyleSheet.create({});