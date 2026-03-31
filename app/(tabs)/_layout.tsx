import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { LayoutDashboard, Layers, Sparkles, MessageCircle } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#904d00',
        tabBarInactiveTintColor: '#515f7466',
        tabBarStyle: {
          position: 'absolute',
          bottom: 24,
          left: 20,
          right: 20,
          elevation: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 24,
          height: 72,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.3)',
          paddingBottom: 8,
          paddingTop: 8,
          shadowColor: '#904d00',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <View className={`p-2 rounded-xl ${focused ? 'bg-orange-50' : ''}`}>
               <LayoutDashboard size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: 'Resources',
          tabBarIcon: ({ color, focused }) => (
            <View className={`p-2 rounded-xl ${focused ? 'bg-orange-50' : ''}`}>
               <Layers size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          tabBarIcon: ({ color, focused }) => (
            <View className={`p-2 rounded-xl ${focused ? 'bg-orange-50' : ''}`}>
               <Sparkles size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <View className={`p-2 rounded-xl ${focused ? 'bg-orange-50' : ''}`}>
               <MessageCircle size={20} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
