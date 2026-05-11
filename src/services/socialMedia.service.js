import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const socialMediaService = {
  getAll() {
    return apiClient.get(API_ENDPOINTS.SOCIAL_MEDIA).then(r => r.data);
  },
  getById(id) {
    return apiClient.get(`${API_ENDPOINTS.SOCIAL_MEDIA}/${id}`).then(r => r.data);
  },
  create(payload) {
    return apiClient.post(API_ENDPOINTS.SOCIAL_MEDIA, payload).then(r => r.data);
  },
  update(id, payload) {
    return apiClient.patch(`${API_ENDPOINTS.SOCIAL_MEDIA}/${id}`, payload).then(r => r.data);
  },
  remove(id) {
    return apiClient.delete(`${API_ENDPOINTS.SOCIAL_MEDIA}/${id}`).then(r => r.data);
  },
};
