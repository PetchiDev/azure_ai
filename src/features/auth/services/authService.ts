import * as AuthSession from 'expo-auth-session';

const CLIENT_ID = process.env.EXPO_PUBLIC_AZURE_CLIENT_ID;
const TENANT_ID = process.env.EXPO_PUBLIC_AZURE_TENANT_ID;
const REDIRECT_URI = process.env.EXPO_PUBLIC_AZURE_REDIRECT_URI || AuthSession.makeRedirectUri();

export const discovery = {
  authorizationEndpoint: `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize`,
  tokenEndpoint: `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
};

export const authConfig: AuthSession.AuthRequestConfig = {
  clientId: CLIENT_ID!,
  scopes: ['https://management.azure.com/user_impersonation', 'offline_access', 'openid', 'profile'],
  redirectUri: REDIRECT_URI,
  responseType: AuthSession.ResponseType.Token,
};
