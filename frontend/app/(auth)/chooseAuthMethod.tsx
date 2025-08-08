import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';

export default function ChooseAuthMethod() {
  return (
    <View>
        <Text>Choose Auth Method</Text>
        <Link href="/faceId">Face ID</Link>
        <Link href="/enterPin">Enter Pin</Link>
    </View>
  );
}
const styles = StyleSheet.create({});