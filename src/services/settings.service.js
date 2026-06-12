import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const settingsService = {
  getSignature() {
    return apiClient.get(API_ENDPOINTS.SETTINGS_SIGNATURE).then(r => r.data);
  },
  updateSignature(signatureUrl) {
    return apiClient.patch(API_ENDPOINTS.SETTINGS_SIGNATURE, { signatureUrl }).then(r => r.data);
  },
};
