import '@/styles/global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator, linking } from '../src/routes/AppNavigator';
import { useColorScheme } from '@/components/useColorScheme';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { useAuthStore } from '@/store/useAuthStore';

WebBrowser.maybeCompleteAuthSession();

const queryClient = new QueryClient();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../src/assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Global: Parse Microsoft redirect token from URL hash before rendering
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token')) return;
    const params = new URLSearchParams(hash.replace('#', '?'));
    const token = params.get('access_token');
    
    if (token) {
      const handleDiscovery = async () => {
        let subId = process.env.EXPO_PUBLIC_AZURE_SUBSCRIPTION_ID || '';
        if (!subId) {
          try {
            const subRes = await fetch('https://management.azure.com/subscriptions?api-version=2022-12-01', {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await subRes.json();
            if (data.value?.length > 0) {
              subId = data.value[0].subscriptionId;
            }
          } catch (e) {
            console.error('Root discovery failed', e);
          }
        }

        useAuthStore.getState().setCredentials({
          tenantId: process.env.EXPO_PUBLIC_AZURE_TENANT_ID || '',
          clientId: process.env.EXPO_PUBLIC_AZURE_CLIENT_ID || '',
          subscriptionId: subId,
          accessToken: token,
          user: { name: 'Azure User', email: 'azure@enterprise.com' }
        });
      };
      
      handleDiscovery();
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);


  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutNav />
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NavigationIndependentTree>
        <NavigationContainer linking={linking}>
          <AppNavigator />
        </NavigationContainer>
      </NavigationIndependentTree>
    </ThemeProvider>
  );
}
