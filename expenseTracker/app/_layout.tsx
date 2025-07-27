import Typo from '@/components/Typo';
import { initDatabase, db } from '@/config/database';
import { AuthProvider } from '@/contexts/authContext';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';


const StackLayout = () => {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDatabase();
        setDbInitialized(true);
      } catch (error) {
        setDbError(error instanceof Error ? error.message : 'Failed to initialize database');
      }
    };

    setupDatabase();
  }, []);

  useDrizzleStudio(db);

  if (dbError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Typo>Database Error: {dbError}</Typo>
      </View>
    );
  }

  if (!dbInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Typo>Initializing...</Typo>
      </View>
    );
  }


  return <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen
      name="(modals)/profileModal"
      options={{
        presentation: "modal",
      }}
    />

    <Stack.Screen
      name="(modals)/transactionModal"
      options={{
        presentation: "modal",
      }}
    />
    
    <Stack.Screen
      name="(modals)/searchModal"
      options={{
        presentation: "modal",
      }}
    />
  </Stack>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StackLayout />
    </AuthProvider>
  )
}