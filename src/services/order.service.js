import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const orderService = {
  getAll() {
    return apiClient.get(API_ENDPOINTS.ORDERS).then(r => r.data);
  },
  getDetail(id) {
    return apiClient.get(`${API_ENDPOINTS.ORDERS}/${id}`).then(r => r.data);
  },
  create(payload) {
    return apiClient.post(API_ENDPOINTS.ORDERS, payload).then(r => r.data);
  },
  updateStatus(id, status) {
    return apiClient.patch(`${API_ENDPOINTS.ORDERS}/${id}/status`, { status }).then(r => r.data);
  },
  updateDetails(id, payload) {
    return apiClient.patch(`${API_ENDPOINTS.ORDERS}/${id}/details`, payload).then(r => r.data);
  },
  completeOrder(id) {
    return apiClient.patch(`${API_ENDPOINTS.ORDERS}/${id}/complete`).then(r => r.data);
  },
  requestRevision(id, items) {
    return apiClient.patch(`${API_ENDPOINTS.ORDERS}/${id}/request-revision`, { items }).then(r => r.data);
  },
  delete(id) {
    return apiClient.delete(`${API_ENDPOINTS.ORDERS}/${id}`).then(r => r.data);
  },
};
