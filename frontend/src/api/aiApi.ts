import api from './client';
import type { ChatMessage } from '@/types';

export const aiApi = {
  chat: (message: string) => api.post<{ reply: string }>('/ai/chat', { message }),
  chatHistory: () => api.get<{ messages: ChatMessage[] }>('/ai/chat/history'),
  recommendations: () => api.get('/ai/recommendations'),
  recognizeMeal: (data: { imageUrl?: string; description?: string }) => api.post('/ai/meal-recognition', data),
  estimateNutrition: (name: string, quantityG: number) =>
    api.post<{ nutrition: { calories: number; protein: number; carbs: number; fat: number; fiber: number; sugar: number } }>(
      '/ai/estimate-nutrition',
      { name, quantityG }
    ),
  weeklyReport: () => api.get<{ report: string }>('/ai/reports/weekly'),
  monthlyReport: () => api.get<{ report: string }>('/ai/reports/monthly'),
};
