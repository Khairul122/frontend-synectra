import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const todoService = {
  getByDate(date) {
    return apiClient.get(`${API_ENDPOINTS.TODOS}?date=${date}`).then(r => r.data);
  },
  create(payload) {
    return apiClient.post(API_ENDPOINTS.TODOS, payload).then(r => r.data);
  },
  update(id, payload) {
    return apiClient.patch(`${API_ENDPOINTS.TODOS}/${id}`, payload).then(r => r.data);
  },
  toggle(id, isCompleted) {
    return apiClient.patch(`${API_ENDPOINTS.TODOS}/${id}/toggle`, { isCompleted }).then(r => r.data);
  },
  remove(id) {
    return apiClient.delete(`${API_ENDPOINTS.TODOS}/${id}`).then(r => r.data);
  },
  carryForward(fromDate, toDate) {
    return apiClient.post(`${API_ENDPOINTS.TODOS}/carry-forward`, { fromDate, toDate }).then(r => r.data);
  },
};
