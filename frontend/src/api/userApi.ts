import api from './client';
import type { User } from '@/types';

export const userApi = {
  getProfile: () => api.get<{ user: User }>('/users/profile'),
  updateProfile: (data: Partial<User>) => api.put<{ user: User }>('/users/profile', data),
  updateTheme: (theme: 'light' | 'dark') => api.patch('/users/theme', { theme }),
};
