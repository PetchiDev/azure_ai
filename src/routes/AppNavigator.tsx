import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { LinkingOptions } from '@react-navigation/native';
import { THEME } from '@/constants/theme';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { DashboardScreen } from '@/features/dashboard/screens/DashboardScreen';
import { ResourceListScreen } from '@/features/resources/screens/ResourceListScreen';
import { AIOptimizationScreen } from '@/features/ai/screens/AIOptimizationScreen';
import { ChatScreen } from '@/features/chat/screens/ChatScreen';
import { useAuthStore } from '@/store/useAuthStore';
import { LayoutDashboard, Layers, Sparkles, MessageCircle } from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export const linking: LinkingOptions<any> = {
  prefixes: ['app://', 'http://localhost:8081', 'http://localhost:8084'],
  config: {
    screens: {
      Login: 'login',
      Main: {
        path: 'main',
        screens: {
          Dashboard: 'dashboard',
          Resources: 'resources',
          Optimization: 'optimization',
          Chat: 'chat',
        },
      },
    },
  },
};

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: THEME.colors.surfaceContainerLowest,
        borderTopWidth: 0,
        height: 60,
        paddingBottom: 10,
      },
      tabBarActiveTintColor: THEME.colors.primary,
      tabBarInactiveTintColor: THEME.colors.onSurfaceVariant,
      tabBarLabelStyle: {
        ...THEME.typography.label,
        fontSize: 10,
      },
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        tabBarIcon: ({ color }) => <LayoutDashboard size={21} color={color} />,
      }}
    />
    <Tab.Screen
      name="Resources"
      component={ResourceListScreen}
      options={{
        tabBarIcon: ({ color }) => <Layers size={21} color={color} />,
      }}
    />
    <Tab.Screen
      name="Optimization"
      component={AIOptimizationScreen}
      options={{
        tabBarLabel: 'AI',
        tabBarIcon: ({ color }) => <Sparkles size={21} color={color} />,
      }}
    />
    <Tab.Screen
      name="Chat"
      component={ChatScreen}
      options={{
        tabBarLabel: 'Chat',
        tabBarIcon: ({ color }) => <MessageCircle size={21} color={color} />,
      }}
    />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
};
