import { Tabs } from "expo-router";
import React from 'react';

export default function TabsLayout() {
    return <Tabs>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="settings" />
    </Tabs>
}