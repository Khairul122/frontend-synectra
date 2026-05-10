import axios from 'axios';
import { API_ENDPOINTS } from '../constants/api';

const client = axios.create({ withCredentials: true });

export const portfolioService = {
  getAll() {
    return client.get(API_ENDPOINTS.PORTFOLIO).then(r => r.data);
  },
  getById(id) {
    return client.get(`${API_ENDPOINTS.PORTFOLIO}/${id}`).then(r => r.data);
  },
  create(payload) {
    return client.post(API_ENDPOINTS.PORTFOLIO, payload).then(r => r.data);
  },
  update(id, payload) {
    return client.patch(`${API_ENDPOINTS.PORTFOLIO}/${id}`, payload).then(r => r.data);
  },
  remove(id) {
    return client.delete(`${API_ENDPOINTS.PORTFOLIO}/${id}`).then(r => r.data);
  },
};
