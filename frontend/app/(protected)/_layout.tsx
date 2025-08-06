import { db, initDatabase } from "@/config/database";
import { useAuth } from "@/contexts/authContext";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin/build/useDrizzleStudio";
import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";

export const unstable_settings = {
  initialRouteName: "(tabs)", // anchor
};

export default function ProtectedLayout() {
  const { user } = useAuth();

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

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="modal"
        options={{
          presentation: "modal",
        }}
      />
    </Stack>
  );
}