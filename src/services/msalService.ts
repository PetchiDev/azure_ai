import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';

const tenantId = process.env.EXPO_PUBLIC_AZURE_TENANT_ID || 'common';
const clientId = process.env.EXPO_PUBLIC_AZURE_CLIENT_ID || '';

// Azure AD Discovery Document
const discovery = {
  authorizationEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
  tokenEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
  revocationEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout`,
};

export const initMSAL = async () => {
  return null;
};

export const signInInteractive = async () => {
    // This function will now be handled inside the React component using useAuthRequest
    // per expo-auth-session best practices for web.
    // We export the configuration here.
    return {
        clientId,
        discovery,
        scopes: ['https://management.azure.com/user_impersonation', 'offline_access', 'openid', 'profile'],
        redirectUri: AuthSession.makeRedirectUri({
            scheme: 'app',
            path: 'login'
        }),
    };
};

export const signInSilent = async () => {
  return null;
};

export const signOut = async () => {
  return null;
};
