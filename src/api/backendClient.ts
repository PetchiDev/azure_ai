import axios from 'axios';

// The AzureBackend runs on port 3000 by default
const BACKEND_URL = 'http://localhost:3101'; 

const backendClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default backendClient;
