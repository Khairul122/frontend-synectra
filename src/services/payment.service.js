import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const paymentService = {
  create(payload) {
    return apiClient.post(API_ENDPOINTS.PAYMENTS, payload).then(r => r.data);
  },
  verify(id) {
    return apiClient.patch(`${API_ENDPOINTS.PAYMENTS}/${id}/verify`).then(r => r.data);
  },
  reject(id, notes) {
    return apiClient.patch(`${API_ENDPOINTS.PAYMENTS}/${id}/reject`, { notes }).then(r => r.data);
  },
};
