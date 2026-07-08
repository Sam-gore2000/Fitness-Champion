import api from './client';
import type { Mission, Badge } from '@/types';

export const missionApi = {
  today: () => api.get<{ missions: Mission[]; xp: number; level: number; streakDays: number }>('/missions/today'),
  updateProgress: (id: string, progress: number) => api.patch(`/missions/${id}/progress`, { progress }),
  badges: () => api.get<{ badges: Badge[]; xp: number; level: number; streakDays: number }>('/missions/badges'),
};
