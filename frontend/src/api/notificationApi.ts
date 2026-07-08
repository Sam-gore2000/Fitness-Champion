import api from './client';
import type { AppNotification } from '@/types';

export const notificationApi = {
  list: () => api.get<{ notifications: AppNotification[]; unreadCount: number }>('/notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};
