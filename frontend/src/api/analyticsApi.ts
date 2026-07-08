import api from './client';

export const analyticsApi = {
  get: (range: 'weekly' | 'monthly' = 'weekly') => api.get('/analytics', { params: { range } }),
};
