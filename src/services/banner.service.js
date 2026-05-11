import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const bannerService = {
  getAll() {
    return apiClient.get(API_ENDPOINTS.BANNERS).then(r => r.data);
  },
  getById(id) {
    return apiClient.get(`${API_ENDPOINTS.BANNERS}/${id}`).then(r => r.data);
  },
  create(payload) {
    return apiClient.post(API_ENDPOINTS.BANNERS, payload).then(r => r.data);
  },
  update(id, payload) {
    return apiClient.patch(`${API_ENDPOINTS.BANNERS}/${id}`, payload).then(r => r.data);
  },
  remove(id) {
    return apiClient.delete(`${API_ENDPOINTS.BANNERS}/${id}`).then(r => r.data);
  },
};
