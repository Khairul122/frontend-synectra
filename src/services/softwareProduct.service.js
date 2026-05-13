import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const softwareProductService = {
  getAll() {
    return apiClient.get(API_ENDPOINTS.SOFTWARE_PRODUCTS).then(r => r.data);
  },
  getPublic() {
    return apiClient.get(`${API_ENDPOINTS.SOFTWARE_PRODUCTS}/public`).then(r => r.data);
  },
  getById(id) {
    return apiClient.get(`${API_ENDPOINTS.SOFTWARE_PRODUCTS}/${id}`).then(r => r.data);
  },
  create(payload) {
    return apiClient.post(API_ENDPOINTS.SOFTWARE_PRODUCTS, payload).then(r => r.data);
  },
  update(id, payload) {
    return apiClient.patch(`${API_ENDPOINTS.SOFTWARE_PRODUCTS}/${id}`, payload).then(r => r.data);
  },
  remove(id) {
    return apiClient.delete(`${API_ENDPOINTS.SOFTWARE_PRODUCTS}/${id}`).then(r => r.data);
  },
};
