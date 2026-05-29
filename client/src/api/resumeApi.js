import api from './axiosInstance.js';

export const resumeApi = {
  upload: (formData) =>
    api.post('/api/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2 min for upload + AI analysis
    }),
  getActive: () => api.get('/api/resume/active'),
  updatePreferences: (data) => api.put('/api/resume/preferences', data),
  getATSScore: (jobDescription) => api.post('/api/resume/ats-score', { jobDescription }),
};
