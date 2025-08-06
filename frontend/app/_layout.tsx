import { Stack } from 'expo-router';
import { use, useEffect, useState } from 'react';

import { db, initDatabase } from '@/config/database';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin/build/useDrizzleStudio';
import { AuthProvider } from '@/contexts/authContext';

export default function RootLayout() {

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen
          name="(protected)"
          options={{
            headerShown: false,
            animation: "none",
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            animation: "none",
          }}
        />
      </Stack>
    </AuthProvider>
    
  );
}
