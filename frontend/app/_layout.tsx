import { AuthProvider, useAuth } from '@/contexts/authContext';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { user, unlocked, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // wait until loading done

    if (!user) {
      router.replace("/(onboarding)");
      return;
    }

    if (!user.emailVerified) {
      router.replace("/(auth)/verifyEmail");
      return;
    }

    if (!user.securityMethod) {
      router.replace("/(auth)/chooseAuthMethod");
      return;
    }

    if (!unlocked) {
      if (user.securityMethod === "pin") {
        router.replace("/(auth)/pin?mode=enter");
        return;
      } 
      if (user.securityMethod === "faceId") {
        handleFaceId();
        return;
      }
    }

    // Fully authenticated & unlocked
    router.replace("/(tabs)/home");
  }, [user, unlocked, loading, router]);

  const handleFaceId = async () => {
    const {success} = await LocalAuthentication.authenticateAsync();
    if (success){
      router.replace('/(tabs)/home')
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Define all your screens here with exact names */}
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}