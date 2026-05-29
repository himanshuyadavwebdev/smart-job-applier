import api from './axiosInstance.js';

export const applyApi = {
  generate: (jobId) => api.post('/api/apply/generate', { jobId }, { timeout: 90000 }),
  confirm: (data) => api.post('/api/apply/confirm', data),
  getHistory: () => api.get('/api/apply/history'),
  updateStatus: (id, status) => api.patch(`/api/apply/${id}/status`, { status }),
};
