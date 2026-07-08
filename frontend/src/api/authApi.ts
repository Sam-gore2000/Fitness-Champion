import api from './client';
import type { User } from '@/types';

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<{ user: User; accessToken: string }>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<{ user: User; accessToken: string }>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<{ user: User }>('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token: string) => api.post(`/auth/verify-email/${token}`),
};
