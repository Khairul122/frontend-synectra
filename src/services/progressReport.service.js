import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const progressReportService = {
  create(payload) {
    return apiClient.post(API_ENDPOINTS.PROGRESS_REPORTS, payload).then(r => r.data);
  },
  getByOrder(orderId) {
    return apiClient.get(`${API_ENDPOINTS.PROGRESS_REPORTS}/order/${orderId}`).then(r => r.data);
  },
};
