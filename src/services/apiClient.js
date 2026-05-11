import axios from 'axios';
import { tokenStorage } from './auth.service';

const apiClient = axios.create({ withCredentials: true });

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

export default apiClient;
