import apiClient from './apiClient';
import { FEEDBACKS_ENDPOINT } from '../constants/api';

export const feedbackService = {
  getPublic() {
    return apiClient.get(`${FEEDBACKS_ENDPOINT}/public`).then(r => r.data);
  },
  create(payload) {
    return apiClient.post(FEEDBACKS_ENDPOINT, payload).then(r => r.data);
  },
  getAll() {
    return apiClient.get(FEEDBACKS_ENDPOINT).then(r => r.data);
  },
  getById(id) {
    return apiClient.get(`${FEEDBACKS_ENDPOINT}/${id}`).then(r => r.data);
  },
  update(id, payload) {
    return apiClient.patch(`${FEEDBACKS_ENDPOINT}/${id}`, payload).then(r => r.data);
  },
  remove(id) {
    return apiClient.delete(`${FEEDBACKS_ENDPOINT}/${id}`).then(r => r.data);
  },
};
