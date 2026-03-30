import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useRouter } from 'expo-router';
import * as AuthSession from 'expo-auth-session';
import { ShieldCheck, Activity, TrendingUp, Triangle, Lock, Info, Terminal, Monitor, Database, Globe } from 'lucide-react-native';

export const LoginScreen = () => {
  const router = useRouter();
  const [tenantId, setTenantId] = useState(process.env.EXPO_PUBLIC_AZURE_TENANT_ID || '');
  const [clientId, setClientId] = useState(process.env.EXPO_PUBLIC_AZURE_CLIENT_ID || '');
  const [clientSecret, setClientSecret] = useState('');
  const [subscriptionId, setSubscriptionId] = useState(process.env.EXPO_PUBLIC_AZURE_SUBSCRIPTION_ID || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanceForm, setShowAdvanceForm] = useState(false);

  const setCredentials = useAuthStore((state) => state.setCredentials);

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'app',
  });

  // Web Auth Request
  // Auth Request configuration
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: clientId || process.env.EXPO_PUBLIC_AZURE_CLIENT_ID!,
      scopes: ['https://management.azure.com/user_impersonation', 'offline_access', 'openid', 'profile'],
      redirectUri: AuthSession.makeRedirectUri({
        scheme: 'app',
        preferLocalhost: Platform.OS === 'web',
      }),
      responseType: AuthSession.ResponseType.Token,
      state: 'azure-kinetic-auth-session-state', // Fixed state prevents CSRF mismatch after app re-mount
      extraParams: {
        prompt: 'select_account', // Forces user to select an account even if already logged in
      },
    },
    { authorizationEndpoint: `https://login.microsoftonline.com/${tenantId || 'common'}/oauth2/v2.0/authorize` }
  );

  // Note: We'll handle the result directly from promptAsync() to avoid state mismatch issues
  // commonly seen with the response variable in Expo Go + Tunnel environments.

  const handleMicrosoftSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!request) {
        setError('Auth request not initialized. Check your credentials.');
        setLoading(false);
        return;
      }
      
      const result = await promptAsync();
      console.log('Auth Result Type:', result.type);
      
      if (result.type === 'success') {
        const { access_token } = result.params;
        if (access_token) {
          console.log('Login successful, processing token...');
          
          let subId = subscriptionId || process.env.EXPO_PUBLIC_AZURE_SUBSCRIPTION_ID || '';
          if (!subId) {
            try {
              const subRes = await axios.get('https://management.azure.com/subscriptions?api-version=2022-12-01', {
                headers: { Authorization: `Bearer ${access_token}` }
              });
              if (subRes.data.value?.length > 0) {
                subId = subRes.data.value[0].subscriptionId;
              }
            } catch (e) {
              console.error('Subscription discovery failed', e);
            }
          }

          await setCredentials({
            tenantId: tenantId || process.env.EXPO_PUBLIC_AZURE_TENANT_ID!,
            clientId: clientId || process.env.EXPO_PUBLIC_AZURE_CLIENT_ID!,
            subscriptionId: subId,
            accessToken: access_token,
            user: { name: 'Azure User', email: 'user@azure.com' }
          });
          
          router.replace('/dashboard' as any);
        } else {
          setError('No access token received.');
          setLoading(false);
        }
      } else if (result.type === 'cancel') {
        setLoading(false);
      } else if (result.type === 'error') {
        console.error('Auth Error:', result.error);
        setError(result.error?.message || 'Authentication failed');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Sign-in Exception:', err);
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  const handleServicePrincipalSignIn = async () => {
    if (!tenantId || !clientId || !clientSecret || !subscriptionId) {
      setError('Required: Tenant, Client ID, Secret, and Subscription');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('scope', 'https://management.azure.com/.default');

      const res = await axios.post(tokenUrl, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (res.data.access_token) {
        await setCredentials({
          tenantId,
          clientId,
          subscriptionId,
          accessToken: res.data.access_token,
          user: {
            name: 'Service Principal',
            email: clientId,
          }
        });
        router.replace('/dashboard' as any);
      }
    } catch (err: any) {
      setError('Invalid credentials. Check Azure Portal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-surface font-body text-on-surface">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}
      >
        {/* Auth Shell Suppression: No BottomNavBar or TopAppBar */}
        <View className="w-full max-w-[420px] flex flex-col items-center">

          {/* Logo Section */}
          <View className="mb-12 flex flex-col items-center text-center">
            <View className="relative mb-6">
              {/* Geometric Kinetic Logo */}
              <View className="w-20 h-20 rounded-md flex items-center justify-center shadow-premium transform rotate-3 overflow-hidden">
                <LinearGradient
                  colors={['#904d00', '#ff8c00']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="absolute inset-0"
                />
                <Triangle size={48} color="white" fill="white" />
              </View>
              {/* Asymmetric Status Indicator */}
              <View className="absolute -top-2 -right-2 w-6 h-6 bg-tertiary-container rounded-full border-4 border-surface flex items-center justify-center">
                <Text className="text-on-tertiary-container text-[12px] font-bold">⚡</Text>
              </View>
            </View>

            <Text className="text-3xl font-extrabold tracking-tighter text-on-surface mb-2 font-headline">
              Azure Kinetic
            </Text>
            <Text className="text-on-surface-variant text-sm max-w-[280px] leading-relaxed text-center">
              Precision cloud orchestration powered by advanced kinetic intelligence.
            </Text>
          </View>

          {/* Login Container */}
          <View className="w-full bg-surface-container-lowest rounded-md shadow-kinetic p-8 border border-outline-variant/10">
            <View className="mb-8">
              <Text className="text-lg font-semibold text-on-surface mb-1">Welcome back</Text>
              <Text className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                Enterprise Authentication Required
              </Text>
            </View>

            {/* Microsoft Sign-In Action */}
            <TouchableOpacity
              onPress={handleMicrosoftSignIn}
              disabled={loading}
              className={`w-full flex-row items-center justify-center gap-3 py-4 px-6 rounded-md bg-white border border-surface-variant shadow-sm active:scale-95 transition-all ${loading ? 'opacity-50' : ''}`}
            >
              <View className="w-5 h-5 flex-row flex-wrap">
                <View className="w-[9px] h-[9px] bg-[#f35325] m-[0.5px]" />
                <View className="w-[9px] h-[9px] bg-[#81bc06] m-[0.5px]" />
                <View className="w-[9px] h-[9px] bg-[#05a6f0] m-[0.5px]" />
                <View className="w-[9px] h-[9px] bg-[#ffba08] m-[0.5px]" />
              </View>
              <Text className="text-sm font-bold text-on-surface">
                {loading ? "Authenticating..." : "Sign in with Microsoft"}
              </Text>
            </TouchableOpacity>

            <View className="relative my-8 items-center justify-center">
              <View className="absolute w-full h-[1px] bg-surface-variant/50" />
              <View className="bg-surface-container-lowest px-3">
                <Text className="text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-widest">
                  AUTHORIZED ACCESS ONLY
                </Text>
              </View>
            </View>

            {/* Description / Value Prop Section */}
            <View className="space-y-4 mb-8">
              <View className="flex-row items-start gap-4 p-3 rounded-md bg-surface-container">
                <View className="mt-1">
                  <Lock size={20} color="#904d00" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-on-surface">Zero-Trust Protocol</Text>
                  <Text className="text-xs text-on-surface-variant leading-normal">Your connection is secured via Azure Active Directory with hardware-level encryption.</Text>
                </View>
              </View>

              <View className="flex-row items-start gap-4 p-3 rounded-md bg-surface-container">
                <View className="mt-1">
                  <Terminal size={20} color="#00658f" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-on-surface">Intelligent Resource Mapping</Text>
                  <Text className="text-xs text-on-surface-variant leading-normal">Instantly visualize cross-tenant dependencies and kinetic resource shifts.</Text>
                </View>
              </View>
            </View>

            {/* Footer Message */}
            <View className="text-center">
              <Text className="text-[10px] text-on-surface-variant/50 uppercase tracking-tighter leading-tight italic text-center">
                By proceeding, you agree to the organizational data processing standards and internal cloud governance policies.
              </Text>
            </View>
          </View>

          {/* System Status Bar */}
          <View className="mt-8 flex-row items-center justify-between w-full px-2">
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
              <Text className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">Nodes: Active</Text>
            </View>
            <View className="flex-row items-center gap-4">
              <Text className="text-[10px] font-medium text-on-surface-variant/40">v2.4.0-KINETIC</Text>
              <Globe size={14} color="#564334" opacity={0.4} />
            </View>
          </View>
        </View>

        {/* Decorative Background Elements */}
        {Platform.OS === 'web' && (
          <View className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <View className="absolute top-[-10%] right-[-5%] w-[60%] h-[40%] rounded-full bg-primary-container/10" style={{ filter: 'blur(120px)' }} />
            <View className="absolute bottom-[-5%] left-[-5%] w-[50%] h-[30%] rounded-full bg-tertiary/10" style={{ filter: 'blur(100px)' }} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};



