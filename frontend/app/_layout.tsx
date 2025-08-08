import { AuthProvider, useAuth } from '@/contexts/authContext';
import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import "../global.css"

export default function RootLayout() {
    return (
        <AuthProvider>
            <RootLayoutNav />
        </AuthProvider>
    )
}

function RootLayoutNav() {
    const { user, needsSecurityVerification} = useAuth();
    console.log(user);

    return (
    <Stack>
        {/* all checks complete, logged in */}
        <Stack.Protected guard={user !== null && !needsSecurityVerification}>
            <Stack.Screen name="(tabs)"
            options={{
                headerShown: false,
                animation: "none",
            }} />
        </Stack.Protected>
        
        {/*  */}
        <Stack.Protected guard={user == null}>
            <Stack.Screen name={"(onboarding)"}/>
        </Stack.Protected>
        <Stack.Screen name='(auth)/login'/>
      </Stack>
    
  );
}