import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const portfolioService = {
  getAll() {
    return apiClient.get(API_ENDPOINTS.PORTFOLIO).then(r => r.data);
  },
  getById(id) {
    return apiClient.get(`${API_ENDPOINTS.PORTFOLIO}/${id}`).then(r => r.data);
  },
  create(payload) {
    return apiClient.post(API_ENDPOINTS.PORTFOLIO, payload).then(r => r.data);
  },
  update(id, payload) {
    return apiClient.patch(`${API_ENDPOINTS.PORTFOLIO}/${id}`, payload).then(r => r.data);
  },
  remove(id) {
    return apiClient.delete(`${API_ENDPOINTS.PORTFOLIO}/${id}`).then(r => r.data);
  },
};
