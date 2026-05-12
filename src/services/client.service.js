import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const clientService = {
  getAll() {
    return apiClient.get(API_ENDPOINTS.CLIENTS).then(r => r.data);
  },
  getById(id) {
    return apiClient.get(`${API_ENDPOINTS.CLIENTS}/${id}`).then(r => r.data);
  },
  update(id, payload) {
    return apiClient.patch(`${API_ENDPOINTS.CLIENTS}/${id}`, payload).then(r => r.data);
  },
  remove(id) {
    return apiClient.delete(`${API_ENDPOINTS.CLIENTS}/${id}`).then(r => r.data);
  },
};
