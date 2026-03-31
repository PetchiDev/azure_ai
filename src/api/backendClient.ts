import axios from 'axios';

// The AzureBackend URL (Local or Production/Lambda)
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3101'; 

const backendClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default backendClient;
