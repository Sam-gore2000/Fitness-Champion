import api from './client';

export const budgetApi = {
  generatePlan: (monthlyBudget: number, currency = 'INR') =>
    api.post<{ plan: string; offline?: boolean }>('/budget/plan', { monthlyBudget, currency }),
};
