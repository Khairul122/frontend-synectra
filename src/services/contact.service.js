import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const contactService = {
  getAll() {
    return apiClient.get(API_ENDPOINTS.CONTACTS).then(r => r.data);
  },
  getById(id) {
    return apiClient.get(`${API_ENDPOINTS.CONTACTS}/${id}`).then(r => r.data);
  },
  create(payload) {
    return apiClient.post(API_ENDPOINTS.CONTACTS, payload).then(r => r.data);
  },
  update(id, payload) {
    return apiClient.patch(`${API_ENDPOINTS.CONTACTS}/${id}`, payload).then(r => r.data);
  },
  remove(id) {
    return apiClient.delete(`${API_ENDPOINTS.CONTACTS}/${id}`).then(r => r.data);
  },
};
