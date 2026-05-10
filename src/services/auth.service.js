import axios from 'axios';
import { API_ENDPOINTS } from '../constants/api';

const client = axios.create({
  withCredentials: true, // kirim & terima httpOnly cookie JWT
});

export const authService = {
  async login(email, password) {
    const response = await client.post(API_ENDPOINTS.LOGIN, { email, password });
    return response.data;
  },

  async logout() {
    const response = await client.post(API_ENDPOINTS.LOGOUT);
    return response.data;
  },

  async getMe() {
    const response = await client.get(API_ENDPOINTS.ME);
    return response.data;
  },

  loginWithGoogle() {
    window.location.href = API_ENDPOINTS.GOOGLE;
  },
};
