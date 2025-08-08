import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';

export default function EnterPin() {
  return (
    <View>
        <Text>Enter your pin</Text>
        <Link href="/(tabs)">Home!</Link>
    </View>
  );
}
const styles = StyleSheet.create({});