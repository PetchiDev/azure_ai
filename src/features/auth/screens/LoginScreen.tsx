import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { THEME } from '../../../constants/theme';
import { KineticInput } from '../../../components/ui/KineticInput';
import { KineticButton } from '../../../components/ui/KineticButton';
import { useAuthStore } from '../../../store/useAuthStore';
import { LinearGradient } from 'expo-linear-gradient';
import * as msalService from '../../../services/msalService';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';

import * as AuthSession from 'expo-auth-session';

export const LoginScreen = () => {
  const router = useRouter();
  const [tenantId, setTenantId] = useState(process.env.EXPO_PUBLIC_AZURE_TENANT_ID || '');
  const [clientId, setClientId] = useState(process.env.EXPO_PUBLIC_AZURE_CLIENT_ID || '');
  const [clientSecret, setClientSecret] = useState('');
  const [subscriptionId, setSubscriptionId] = useState(process.env.EXPO_PUBLIC_AZURE_SUBSCRIPTION_ID || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setCredentials = useAuthStore((state) => state.setCredentials);

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'app',
  });

  useEffect(() => {
    console.log('Detected Redirect URI:', redirectUri);
  }, []);

  // Web Auth Request
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: clientId || process.env.EXPO_PUBLIC_AZURE_CLIENT_ID!,
      scopes: ['https://management.azure.com/user_impersonation', 'offline_access', 'openid', 'profile'],
      redirectUri: AuthSession.makeRedirectUri({
        scheme: 'app',
      }),
      responseType: AuthSession.ResponseType.Token,
    },
    { authorizationEndpoint: `https://login.microsoftonline.com/${tenantId || 'common'}/oauth2/v2.0/authorize` }
  );

  useEffect(() => {
    console.log('Auth Response Type:', response?.type);
    if (response?.type === 'success') {
      console.log('Auth Params:', Object.keys(response.params));
      const { access_token } = response.params;
      if (access_token) {
        setCredentials({
          tenantId: tenantId || process.env.EXPO_PUBLIC_AZURE_TENANT_ID!,
          clientId: clientId || process.env.EXPO_PUBLIC_AZURE_CLIENT_ID!,
          subscriptionId: subscriptionId || process.env.EXPO_PUBLIC_AZURE_SUBSCRIPTION_ID || '',
          accessToken: access_token,
          user: { name: 'Azure Web User', email: 'web@azure.com' }
        });
        console.log('Login successful, navigating...');
        router.replace('/dashboard' as any);
      } else {
        console.error('No access token in response params');
        setError('No access token received. Check Azure App Registration Implicit Flow settings.');
      }
    } else if (response?.type === 'error') {
      console.error('Auth Error:', response.error);
      setError(response.error?.message || 'Authentication error');
    }
  }, [response]);


  const handleMicrosoftSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      if (Platform.OS === 'web') {
        await promptAsync();
      } else {
        const result = await msalService.signInInteractive();
        if (result.accessToken) {
          await setCredentials({
            tenantId: tenantId || process.env.EXPO_PUBLIC_AZURE_TENANT_ID!,
            clientId: clientId || process.env.EXPO_PUBLIC_AZURE_CLIENT_ID!,
            subscriptionId: subscriptionId || process.env.EXPO_PUBLIC_AZURE_SUBSCRIPTION_ID || '',
            accessToken: result.accessToken,
            user: {
              name: result.account.name || '',
              email: result.account.username || '',
            }
          });
          router.replace('/dashboard' as any);
        }
      }
    } catch (err: any) {
      console.error('MSAL Login Error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
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
    <ScrollView contentContainerStyle={styles.container} style={styles.scroll}>
      <LinearGradient
        colors={THEME.colors.kineticGradient as any}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.brand}>AZURE RESOURCES MOBILE</Text>
          <Text style={styles.title}>Manage Infrastructure Anywhere</Text>
          <Text style={styles.subtitle}>
            Authenticate with Azure AD or use a Service Principal.
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Azure Authentication</Text>
        
        <KineticButton
          title={loading ? "Authenticating..." : "Sign In with Microsoft"}
          onPress={handleMicrosoftSignIn}
          style={styles.microsoftButton}
          disabled={loading || (Platform.OS === 'web' && !request)}
        />
        {Platform.OS === 'web' && (
          <Text style={styles.webWarning}>
            * Using Web Redirect Flow
          </Text>
        )}



        <View style={styles.separatorContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR SERVICE PRINCIPAL</Text>
          <View style={styles.line} />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <KineticInput
          label="Tenant ID"
          placeholder="00000000-0000-0000-0000-000000000000"
          value={tenantId}
          onChangeText={setTenantId}
        />
        <KineticInput
          label="Client ID"
          placeholder="00000000-0000-0000-0000-000000000000"
          value={clientId}
          onChangeText={setClientId}
        />
        <KineticInput
          label="Client Secret"
          placeholder="Enter secret"
          secureTextEntry
          value={clientSecret}
          onChangeText={setClientSecret}
        />
        <KineticInput
          label="Subscription ID"
          placeholder="00000000-0000-0000-0000-000000000000"
          value={subscriptionId}
          onChangeText={setSubscriptionId}
        />

        <KineticButton
          title="Login with Principal"
          onPress={handleServicePrincipalSignIn}
          style={styles.submitButton}
          variant="outline"
          disabled={loading}
        />

        <View style={styles.footer}>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Need help with Azure Auth?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: THEME.colors.background,
  },
  container: {
    flexGrow: 1,
  },
  header: {
    padding: THEME.spacing.xl,
    paddingTop: 60,
    minHeight: 250,
    justifyContent: 'center',
  },
  headerContent: {
    maxWidth: 300,
  },
  brand: {
    ...THEME.typography.label,
    color: 'white',
    opacity: 0.8,
    marginBottom: THEME.spacing.md,
  },
  title: {
    ...THEME.typography.h1,
    color: 'white',
    marginBottom: THEME.spacing.sm,
  },
  subtitle: {
    ...THEME.typography.body,
    color: 'white',
    opacity: 0.8,
  },
  formContainer: {
    padding: THEME.spacing.xl,
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: THEME.borderRadius.xl,
    borderTopRightRadius: THEME.borderRadius.xl,
    marginTop: -20,
    flex: 1,
  },
  formTitle: {
    ...THEME.typography.h2,
    color: THEME.colors.onSurface,
    marginBottom: THEME.spacing.md,
  },
  microsoftButton: {
    marginBottom: THEME.spacing.lg,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
    opacity: 0.6,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.colors.outlineVariant,
  },
  orText: {
    ...THEME.typography.label,
    marginHorizontal: THEME.spacing.md,
    color: THEME.colors.onSurfaceVariant,
    fontSize: 9,
  },
  errorText: {
    color: THEME.colors.error,
    marginBottom: THEME.spacing.md,
    ...THEME.typography.body,
    fontSize: 12,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: THEME.spacing.lg,
  },
  footer: {
    marginTop: THEME.spacing.xl,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.outlineVariant,
    paddingTop: THEME.spacing.lg,
  },
  footerLink: {
    ...THEME.typography.label,
    color: THEME.colors.primary,
  },
  webWarning: {
    color: THEME.colors.onSurfaceVariant,
    fontSize: 10,
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
    fontStyle: 'italic',
  },
});


