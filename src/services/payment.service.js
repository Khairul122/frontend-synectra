import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const paymentService = {
  create(payload) {
    return apiClient.post(API_ENDPOINTS.PAYMENTS, payload).then(r => r.data);
  },
  verify(id) {
    return apiClient.patch(`${API_ENDPOINTS.PAYMENTS}/${id}/verify`).then(r => r.data);
  },
  reject(id, notes) {
    return apiClient.patch(`${API_ENDPOINTS.PAYMENTS}/${id}/reject`, { notes }).then(r => r.data);
  },
  getIncome(view = 'monthly', year, month) {
    const params = new URLSearchParams({ view });
    if (year)  params.set('year',  String(year));
    if (month) params.set('month', String(month));
    return apiClient.get(`${API_ENDPOINTS.PAYMENTS}/income?${params}`).then(r => r.data);
  },
};
