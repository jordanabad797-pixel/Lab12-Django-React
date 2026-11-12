import axios from 'axios';
import { API_BASE_URL, API_TOKEN } from './config.js';

/**
 * Shared Axios instance. Every request of the app goes through it, so the
 * base URL, timeout and authentication header are configured only once.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

// DRF TokenAuthentication expects: "Authorization: Token <key>".
apiClient.interceptors.request.use((config) => {
  if (API_TOKEN) {
    config.headers.Authorization = `Token ${API_TOKEN}`;
  }
  return config;
});

export default apiClient;
