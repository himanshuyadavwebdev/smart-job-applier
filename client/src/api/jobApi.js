import api from './axiosInstance.js';

export const jobApi = {
  getMatched: (params) => api.get('/api/jobs/match', { params }),
  getById: (id) => api.get(`/api/jobs/${id}`),
  save: (jobId) => api.post('/api/jobs/save', { jobId }),
  unsave: (jobId) => api.delete(`/api/jobs/save/${jobId}`),
  getSaved: () => api.get('/api/jobs/saved'),
};
