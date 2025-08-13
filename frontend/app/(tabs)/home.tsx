import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useAuth } from '@/contexts/authContext';
import { Link } from 'expo-router';
import Typo from '@/components/Typo';
import { signOut } from 'firebase/auth';
import { auth } from '@/config/firebase';

export default function Home() {
  const {logout} = useAuth();

  return (
    <View>
      <Text>Home Page</Text>
      <Pressable onPress={() => logout()}><Text>Logout</Text></Pressable>
    </View>
  );
}
const styles = StyleSheet.create({});