import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';

export default function FaceID() {
  return (
    <View>
        <Text>Face id</Text>
        <Link href="/(tabs)/home">Home!</Link>
    </View>
  );
}
const styles = StyleSheet.create({});