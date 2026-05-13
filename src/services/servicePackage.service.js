import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const servicePackageService = {
  getAll() {
    return apiClient.get(API_ENDPOINTS.SERVICE_PACKAGES).then(r => r.data);
  },
  getPublic() {
    return apiClient.get(`${API_ENDPOINTS.SERVICE_PACKAGES}/public`).then(r => r.data);
  },
  getById(id) {
    return apiClient.get(`${API_ENDPOINTS.SERVICE_PACKAGES}/${id}`).then(r => r.data);
  },
  create(payload) {
    return apiClient.post(API_ENDPOINTS.SERVICE_PACKAGES, payload).then(r => r.data);
  },
  update(id, payload) {
    return apiClient.patch(`${API_ENDPOINTS.SERVICE_PACKAGES}/${id}`, payload).then(r => r.data);
  },
  remove(id) {
    return apiClient.delete(`${API_ENDPOINTS.SERVICE_PACKAGES}/${id}`).then(r => r.data);
  },
};
