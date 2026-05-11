import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const bankAccountService = {
  getAll() {
    return apiClient.get(API_ENDPOINTS.BANK_ACCOUNTS).then(r => r.data);
  },
  getById(id) {
    return apiClient.get(`${API_ENDPOINTS.BANK_ACCOUNTS}/${id}`).then(r => r.data);
  },
  create(payload) {
    return apiClient.post(API_ENDPOINTS.BANK_ACCOUNTS, payload).then(r => r.data);
  },
  update(id, payload) {
    return apiClient.patch(`${API_ENDPOINTS.BANK_ACCOUNTS}/${id}`, payload).then(r => r.data);
  },
  remove(id) {
    return apiClient.delete(`${API_ENDPOINTS.BANK_ACCOUNTS}/${id}`).then(r => r.data);
  },
};
