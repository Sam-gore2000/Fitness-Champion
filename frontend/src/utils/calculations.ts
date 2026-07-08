import type { ActivityLevel, Goal } from '@/types';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calculateBMR(gender: string, weightKg: number, heightCm: number, age: number) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === 'male' ? base + 5 : base - 161);
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel) {
  return Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.2));
}

export function calculateDailyCalories(tdee: number, goal: Goal) {
  if (goal === 'fat_loss') return Math.round(tdee * 0.8);
  if (goal === 'muscle_gain') return Math.round(tdee * 1.12);
  return tdee;
}

export function ringPercent(value: number, target: number) {
  if (!target) return 0;
  return Math.min(100, Math.round((value / target) * 100));
}

export function formatNumber(n?: number) {
  if (n === undefined || n === null) return '—';
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}
