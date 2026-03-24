import axios from 'axios';
import { useAuthStore } from '../store/useStore';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://management.azure.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const { subscriptionId, tenantId, accessToken } = useAuthStore.getState();

  if (config.url) {
    if (subscriptionId) {
      config.url = config.url.replace('{subscriptionId}', subscriptionId);
    }
    if (tenantId) {
      config.url = config.url.replace('{tenantId}', tenantId);
    }
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;

