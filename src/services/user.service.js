import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const userService = {
  resetPassword(userId, newPassword) {
    return apiClient.patch(`${API_ENDPOINTS.USERS}/${userId}/password`, { newPassword }).then(r => r.data);
  },
};
