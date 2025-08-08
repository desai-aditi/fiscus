import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';

export default function VerifyEmail() {
  return (
    <View>
        <Text>Verify Email</Text>
        <Link href="/chooseAuthMethod">next</Link>
    </View>
  );
}
const styles = StyleSheet.create({});