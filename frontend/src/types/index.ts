export type Goal = 'muscle_gain' | 'fat_loss' | 'maintenance';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type DietaryPreference = 'none' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'halal' | 'kosher';
export type WorkoutExperience = 'beginner' | 'intermediate' | 'advanced';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  avatarUrl?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  heightCm?: number;
  weightKg?: number;
  targetWeightKg?: number;
  goal: Goal;
  activityLevel: ActivityLevel;
  dietaryPreference: DietaryPreference;
  workoutExperience: WorkoutExperience;
  onboardingComplete: boolean;
  bmr?: number;
  tdee?: number;
  dailyCalories?: number;
  dailyProtein?: number;
  dailyCarbs?: number;
  dailyFat?: number;
  dailyWaterMl: number;
  dailySteps: number;
  dailySleepHours: number;
  xp: number;
  level: number;
  streakDays: number;
  theme: 'light' | 'dark';
}

export interface Meal {
  _id: string;
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  source: 'manual' | 'search' | 'barcode' | 'image' | 'voice';
  quantityG: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  imageUrl?: string;
  loggedAt: string;
}

export interface DailyLog {
  _id?: string;
  date: string;
  caloriesConsumed: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  waterMl: number;
  steps: number;
  sleepHours: number;
  workoutCompleted: boolean;
  status: 'green' | 'yellow' | 'red' | 'pending';
}

export interface ExerciseSet {
  reps: number;
  weightKg: number;
  restSeconds?: number;
  isPR?: boolean;
}

export interface ExerciseEntry {
  name: string;
  muscleGroup?: string;
  sets: ExerciseSet[];
}

export interface Workout {
  _id: string;
  name: string;
  date: string;
  durationMinutes?: number;
  exercises: ExerciseEntry[];
  notes?: string;
}

export interface PersonalRecord {
  _id: string;
  exerciseName: string;
  weightKg: number;
  reps: number;
  achievedAt: string;
}

export interface BodyMeasurement {
  _id: string;
  date: string;
  weightKg?: number;
  chestCm?: number;
  waistCm?: number;
  armsCm?: number;
  legsCm?: number;
  neckCm?: number;
  bodyFatPct?: number;
  photoUrl?: string;
}

export interface Mission {
  _id: string;
  type: 'protein' | 'calories' | 'water' | 'workout' | 'steps' | 'sleep';
  label: string;
  target: number;
  progress: number;
  unit: string;
  xpReward: number;
  completed: boolean;
}

export interface Badge {
  _id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
}

export interface AppNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

export interface GroceryItem {
  name: string;
  quantity: string;
  category: string;
  estimatedCost: number;
  checked: boolean;
}

export interface GroceryList {
  _id: string;
  weekOf: string;
  items: GroceryItem[];
  totalEstimatedCost?: number;
}
