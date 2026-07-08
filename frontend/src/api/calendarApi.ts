import api from './client';

export const calendarApi = {
  getMonth: (year: number, month: number) =>
    api.get<{ days: Record<string, string> }>('/calendar', { params: { year, month } }),
};
