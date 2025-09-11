// import { TabList, Tabs, TabSlot, TabTrigger } from "expo-router/ui";
import React, { useEffect, useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { colors } from "@/constants/theme";
import { db, initDatabase, seededUserCategories, seedUserAccounts, seedUserCategories } from "@/config/database";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin/build/useDrizzleStudio";
import { StyleSheet, TouchableOpacity } from "react-native";
import { scale, verticalScale } from "@/utils/styling";
import Typo from "@/components/Typo";
import { radius } from "@/constants/scaling";
import { router, Tabs } from "expo-router";
import { useAuth } from '@/contexts/authContext';

export default function TabsLayout() {
    const [dbInitialized, setDbInitialized] = useState(false);
    const [dbError, setDbError] = useState<string | null>(null);
    
    const {user} = useAuth();
  
    // Initialize database
    useEffect(() => {
      const setupDatabase = async () => {
        try {
          await initDatabase();
          await seedUserCategories(user?.uid);    
          await seedUserAccounts(user?.uid);    
          setDbInitialized(true);
        } catch (error) {
          setDbError(error instanceof Error ? error.message : 'Failed to initialize database');
        }
      };
  
      setupDatabase();
    }, []);
  
    // Always call useDrizzleStudio
    useDrizzleStudio(db);

    return <Tabs>
            {/* <TabSlot />
            <TabList>
                <TabTrigger name="home" href="/(tabs)/home">
                    <Typo>Home</Typo>
                </TabTrigger>
                <TabTrigger name="transactions" href="/(tabs)/transactions">
                    <Typo>Transactions</Typo>
                </TabTrigger>
                <TabTrigger name="profile" href="/(tabs)/profile">
                    <Typo>profile</Typo>
                </TabTrigger>
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => router.push('/(modals)/transaction')}
                >
                    <SymbolView name="plus" size={30} tintColor={colors.primary}/>
                </TouchableOpacity>
            </TabList> */}

        <Tabs.Screen name="home" options={{
            headerShown: false,
            tabBarLabel: 'Home',
            tabBarIcon: () => <SymbolView name="tray" tintColor={colors.primary} size={28}/>,
            tabBarLabelStyle: {color: colors.primary}
        }}/> 
        <Tabs.Screen name="transactions" options={{
            headerShown: false,
            tabBarLabel: 'Transactions',
            tabBarIcon: () => <SymbolView name="creditcard" />
        }}/>
        <Tabs.Screen
            name='add'
            listeners={() => ({
            tabPress: (e) => {
                e.preventDefault();
                router.push('/(modals)/transaction');
            },
            })}
        />
        <Tabs.Screen name="profile" options={{
            headerShown: false,
            tabBarLabel: 'Profile',
            tabBarIcon: () => <SymbolView name="person" />
        }}/>

    </Tabs>
}

const styles = StyleSheet.create({
    fab:{
        padding: scale(9),
        backgroundColor: colors.white,
        borderRadius: radius._30,
        position: 'absolute',
        right: scale(20),
        bottom: verticalScale(80),
        zIndex: 100
    }
})