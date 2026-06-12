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
  updatePriority(id, priority) {
    return apiClient.patch(`${API_ENDPOINTS.ORDERS}/${id}/priority`, { priority }).then(r => r.data);
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
  createAdminRevision(id, items) {
    return apiClient.post(`${API_ENDPOINTS.ORDERS}/${id}/revisions`, { items }).then(r => r.data);
  },
  respondRevision(id, revisionId, payload) {
    return apiClient.patch(`${API_ENDPOINTS.ORDERS}/${id}/revisions/${revisionId}/respond`, payload).then(r => r.data);
  },
  delete(id) {
    return apiClient.delete(`${API_ENDPOINTS.ORDERS}/${id}`).then(r => r.data);
  },
  downloadInvoice(id) {
    return apiClient.get(`${API_ENDPOINTS.ORDERS}/${id}/invoice`, { responseType: 'blob' }).then(r => r.data);
  },
};

export function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
