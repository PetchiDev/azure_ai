import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { LinkingOptions } from '@react-navigation/native';
import { THEME } from '@/constants/theme';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { DashboardScreen } from '@/features/dashboard/screens/DashboardScreen';
import { ResourceListScreen } from '@/features/resources/screens/ResourceListScreen';
import { ResourceDetailScreen } from '@/features/resources/screens/ResourceDetailScreen';
import { OrderFlowScreen } from '@/features/resources/screens/OrderFlowScreen';
import { OrderSuccessScreen } from '@/features/resources/screens/OrderSuccessScreen';
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
      ResourceDetail: 'resource/:id',
      OrderFlow: 'order',
      OrderSuccess: 'success',
    },
  },
};

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
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
    })}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        tabBarIcon: ({ color, focused }) => (
          <View className={`p-2 rounded-xl ${focused ? 'bg-orange-50' : ''}`}>
             <LayoutDashboard size={20} color={color} />
          </View>
        ),
      }}
    />
    <Tab.Screen
      name="Resources"
      component={ResourceListScreen}
      options={{
        tabBarIcon: ({ color, focused }) => (
          <View className={`p-2 rounded-xl ${focused ? 'bg-orange-50' : ''}`}>
             <Layers size={20} color={color} />
          </View>
        ),
      }}
    />
    <Tab.Screen
      name="Optimization"
      component={AIOptimizationScreen}
      options={{
        tabBarLabel: 'AI',
        tabBarIcon: ({ color, focused }) => (
          <View className={`p-2 rounded-xl ${focused ? 'bg-orange-50' : ''}`}>
             <Sparkles size={20} color={color} />
          </View>
        ),
      }}
    />
    <Tab.Screen
      name="Chat"
      component={ChatScreen}
      options={{
        tabBarLabel: 'Chat',
        tabBarIcon: ({ color, focused }) => (
          <View className={`p-2 rounded-xl ${focused ? 'bg-orange-50' : ''}`}>
             <MessageCircle size={20} color={color} />
          </View>
        ),
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
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="ResourceDetail" component={ResourceDetailScreen} />
          <Stack.Screen name="OrderFlow" component={OrderFlowScreen} />
          <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
