import api from './client';

export const budgetApi = {
  generatePlan: (monthlyBudget: number, currency = 'USD') =>
    api.post<{ plan: string }>('/budget/plan', { monthlyBudget, currency }),
};
