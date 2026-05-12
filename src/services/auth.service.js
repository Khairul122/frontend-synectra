import axios from 'axios';
import { API_ENDPOINTS } from '../constants/api';

const TOKEN_KEY = 'synectra_token';

export const tokenStorage = {
  get: ()        => localStorage.getItem(TOKEN_KEY),
  set: (token)   => localStorage.setItem(TOKEN_KEY, token),
  clear: ()      => localStorage.removeItem(TOKEN_KEY),
};

// Client khusus auth — interceptor dipasang di apiClient.js untuk service lain
const client = axios.create({ withCredentials: true });

client.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

export const authService = {
  async register(email, fullName, password) {
    const response = await client.post(API_ENDPOINTS.REGISTER, { email, fullName, password });
    return response.data;
  },

  async login(email, password) {
    const response = await client.post(API_ENDPOINTS.LOGIN, { email, password });
    return response.data;
  },

  async logout() {
    const response = await client.post(API_ENDPOINTS.LOGOUT);
    tokenStorage.clear();
    return response.data;
  },

  async getMe() {
    const response = await client.get(API_ENDPOINTS.ME);
    return response.data;
  },

  loginWithGoogle() {
    window.location.href = API_ENDPOINTS.GOOGLE;
  },

  async updateProfile(payload) {
    const response = await client.patch(API_ENDPOINTS.PROFILE, payload);
    return response.data;
  },

  async changePassword(payload) {
    const response = await client.patch(API_ENDPOINTS.CHANGE_PASSWORD, payload);
    return response.data;
  },
};
