import api from './client';
import type { Workout, PersonalRecord } from '@/types';

export const workoutApi = {
  create: (data: Partial<Workout>) => api.post('/workouts', data),
  list: (params?: { from?: string; to?: string }) => api.get<{ workouts: Workout[] }>('/workouts', { params }),
  remove: (id: string) => api.delete(`/workouts/${id}`),
  records: (exercise?: string) => api.get<{ records: PersonalRecord[] }>('/workouts/records', { params: { exercise } }),
};
