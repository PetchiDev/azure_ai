import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { THEME } from '../../../constants/theme';
import { KineticInput } from '../../../components/ui/KineticInput';
import { KineticButton } from '../../../components/ui/KineticButton';
import { useAuthStore } from '../../../store/useStore';
import { LinearGradient } from 'expo-linear-gradient';
import * as AuthSession from 'expo-auth-session';
import { authConfig, discovery } from '../services/authService';
import axios from 'axios';

export const LoginScreen = () => {
  const [tenantId, setTenantId] = useState(process.env.EXPO_PUBLIC_AZURE_TENANT_ID || '');
  const [clientId, setClientId] = useState(process.env.EXPO_PUBLIC_AZURE_CLIENT_ID || '');
  const [clientSecret, setClientSecret] = useState('');
  const [subscriptionId, setSubscriptionId] = useState(process.env.EXPO_PUBLIC_AZURE_SUBSCRIPTION_ID || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setCredentials = useAuthStore((state) => state.setCredentials);

  // Microsoft Interactive Login Hook
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      ...authConfig,
      clientId: clientId || process.env.EXPO_PUBLIC_AZURE_CLIENT_ID!,
    },
    discovery
  );

  // Parse token from URL hash on page load (handles redirect-based web login return)
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token')) return;

    const params = new URLSearchParams(hash.replace('#', '?'));
    const token = params.get('access_token');
    if (token) {
      setCredentials({
        tenantId: tenantId || process.env.EXPO_PUBLIC_AZURE_TENANT_ID!,
        clientId: clientId || process.env.EXPO_PUBLIC_AZURE_CLIENT_ID!,
        subscriptionId: subscriptionId || process.env.EXPO_PUBLIC_AZURE_SUBSCRIPTION_ID || '',
        accessToken: token,
      });
      // Clean the URL after consuming the token
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const handleMicrosoftSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // Web: Use redirect flow to avoid Cross-Origin-Opener-Policy popup issues
        const effectiveTenantId = tenantId || process.env.EXPO_PUBLIC_AZURE_TENANT_ID!;
        const effectiveClientId = clientId || process.env.EXPO_PUBLIC_AZURE_CLIENT_ID!;
        const redirectUri = process.env.EXPO_PUBLIC_AZURE_REDIRECT_URI || window.location.origin + '/';
        const scope = encodeURIComponent('https://management.azure.com/user_impersonation openid profile offline_access');
        const authUrl = `https://login.microsoftonline.com/${effectiveTenantId}/oauth2/v2.0/authorize?client_id=${effectiveClientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_mode=fragment`;
        window.location.href = authUrl;
        return; // Loading state stays true as browser redirects
      }
      // Native: use expo-auth-session popup (works fine on mobile)
      const result = await promptAsync();
      if (result?.type === 'cancel') {
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication flow failed');
      setLoading(false);
    }
  };

  const handleServicePrincipalSignIn = async () => {
    if (!tenantId || !clientId || !clientSecret || !subscriptionId) {
      setError('Please fill all fields (Tenant, Client ID, Secret, Subscription)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
      const data = new URLSearchParams();
      data.append('grant_type', 'client_credentials');
      data.append('client_id', clientId);
      data.append('client_secret', clientSecret);
      data.append('scope', 'https://management.azure.com/.default');

      const res = await axios.post(tokenUrl, data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (res.data.access_token) {
        setCredentials({
          tenantId,
          clientId,
          subscriptionId,
          accessToken: res.data.access_token,
        });
      }
    } catch (err: any) {
      console.error('Manual login failed:', err.response?.data || err.message);
      setError('Invalid credentials or secret. Please check Azure Portal.');
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
          <Text style={styles.brand}>KINETIC VAULT</Text>
          <Text style={styles.title}>Enterprise Cloud & AI Optimization</Text>
          <Text style={styles.subtitle}>
            Sign in with Microsoft or use a Service Principal for developer environments.
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Sign In</Text>
        
        <KineticButton
          title={loading ? "Redirecting..." : "Sign In with Microsoft"}
          onPress={handleMicrosoftSignIn}
          style={styles.microsoftButton}
          disabled={loading || !request}
        />

        <View style={styles.separatorContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR SERVICE PRINCIPAL (DEVELOPER)</Text>
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
          placeholder="Ex: _XyZ~123..."
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
          title="Manual Vault Access"
          onPress={handleServicePrincipalSignIn}
          style={styles.submitButton}
          variant="outline"
          disabled={loading}
        />

        <View style={styles.footer}>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Security Architecture & Support</Text>
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
});
