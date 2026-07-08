import api from './client';
import type { DailyLog, Meal } from '@/types';

export const nutritionApi = {
  searchFoods: (q: string) => api.get('/nutrition/foods/search', { params: { q } }),
  logMeal: (data: Partial<Meal> & { foodId?: string }) => api.post('/nutrition/meals', data),
  getMeals: (date?: string) => api.get<{ meals: Meal[] }>('/nutrition/meals', { params: { date } }),
  deleteMeal: (id: string) => api.delete(`/nutrition/meals/${id}`),
  logWater: (amountMl: number) => api.post('/nutrition/water', { amountMl }),
  logSteps: (steps: number) => api.post('/nutrition/steps', { steps }),
  logSleep: (hours: number) => api.post('/nutrition/sleep', { hours }),
  getDailyLog: (date?: string) =>
    api.get<{ dailyLog: DailyLog; targets: Record<string, number> }>('/nutrition/daily-log', { params: { date } }),
};
