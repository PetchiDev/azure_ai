import MSAL, { 
  MSALConfiguration, 
  MSALInteractiveParams, 
  MSALSilentParams, 
  MSALResult 
} from 'react-native-msal';
import { Platform } from 'react-native';

const tenantId = process.env.EXPO_PUBLIC_AZURE_TENANT_ID;
const clientId = process.env.EXPO_PUBLIC_AZURE_CLIENT_ID;

const msalConfig: MSALConfiguration = {
  auth: {
    clientId: clientId!,
    authority: `https://login.microsoftonline.com/${tenantId || 'common'}`,
    redirectUri: Platform.select({
      ios: `msauth.com.azure.ui://auth`, // Placeholder bundle ID, update as needed
      android: `msauth://com.azure.ui/callback`,
      default: undefined
    }),
  },
};

let pca: MSAL | null = null;

export const initMSAL = async () => {
  if (!pca) {
    pca = new MSAL(msalConfig);
    await pca.init();
  }
  return pca;
};

export const signInInteractive = async (): Promise<MSALResult> => {
  const client = await initMSAL();
  const params: MSALInteractiveParams = {
    scopes: [
      'https://management.azure.com/user_impersonation',
      'https://vault.azure.net/user_impersonation',
      'offline_access',
      'openid',
      'profile'
    ],
  };
  return await client.acquireToken(params);
};

export const signInSilent = async (accountIdentifier: string): Promise<MSALResult> => {
  const client = await initMSAL();
  const params: MSALSilentParams = {
    accountIdentifier,
    scopes: ['https://management.azure.com/user_impersonation'],
    forceRefresh: false,
  };
  return await client.acquireTokenSilent(params);
};

export const signOut = async (accountIdentifier: string) => {
  const client = await initMSAL();
  await client.removeAccount(accountIdentifier);
};
