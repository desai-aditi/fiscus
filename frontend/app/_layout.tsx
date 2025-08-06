import { Stack } from 'expo-router';
import { use, useEffect, useState } from 'react';

import { db, initDatabase } from '@/config/database';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin/build/useDrizzleStudio';
import { AuthProvider } from '@/contexts/authContext';

export default function RootLayout() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Initialize database
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

  // Always call useDrizzleStudio
  useDrizzleStudio(db);
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
