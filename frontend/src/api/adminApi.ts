import api from './client';

export const adminApi = {
  stats: () => api.get('/admin/stats'),
  listUsers: (q?: string) => api.get('/admin/users', { params: { q } }),
  updateUser: (id: string, data: any) => api.patch(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  listFoods: (q?: string) => api.get('/admin/foods', { params: { q } }),
  createFood: (data: any) => api.post('/admin/foods', data),
  updateFood: (id: string, data: any) => api.put(`/admin/foods/${id}`, data),
  deleteFood: (id: string) => api.delete(`/admin/foods/${id}`),
  broadcast: (data: { title: string; message: string; userIds?: string[] }) =>
    api.post('/admin/notifications/broadcast', data),
  listPrompts: () => api.get('/admin/ai-prompts'),
  upsertPrompt: (data: { key: string; label: string; systemPrompt: string }) =>
    api.put('/admin/ai-prompts', data),
};
