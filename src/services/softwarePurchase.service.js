import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const softwarePurchaseService = {
  getAll() {
    return apiClient.get(API_ENDPOINTS.SOFTWARE_PURCHASES).then(r => r.data);
  },
  create(payload) {
    return apiClient.post(API_ENDPOINTS.SOFTWARE_PURCHASES, payload).then(r => r.data);
  },
  uploadReceipt(id, payload) {
    return apiClient.patch(`${API_ENDPOINTS.SOFTWARE_PURCHASES}/${id}/receipt`, payload).then(r => r.data);
  },
  verify(id) {
    return apiClient.patch(`${API_ENDPOINTS.SOFTWARE_PURCHASES}/${id}/verify`).then(r => r.data);
  },
  reject(id, notes) {
    return apiClient.patch(`${API_ENDPOINTS.SOFTWARE_PURCHASES}/${id}/reject`, { notes }).then(r => r.data);
  },
};
