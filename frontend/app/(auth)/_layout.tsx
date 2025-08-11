import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
    return (
        <Stack screenOptions={{ headerShown: false}}>
            <Stack.Screen name={"login"}/>
            <Stack.Screen name={"register"}/>
            <Stack.Screen name={"verifyEmail"}/>
            <Stack.Screen name={"chooseAuthMethod"}/>
            <Stack.Screen name={"pin"}/>
            <Stack.Screen name={"faceId"}/>
            <Stack.Screen name={"forgotPasswordOne"}/>
            <Stack.Screen name={"forgotPasswordTwo"}/>
            <Stack.Screen name={"forgotPasswordThree"}/>
        </Stack>
    )
}