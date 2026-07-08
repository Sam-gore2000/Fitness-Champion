import api from './client';
import type { BodyMeasurement } from '@/types';

export const bodyApi = {
  create: (data: Partial<BodyMeasurement>) => api.post('/body', data),
  list: (range: 'weekly' | 'monthly' = 'monthly') =>
    api.get<{ measurements: BodyMeasurement[] }>('/body', { params: { range } }),
};
