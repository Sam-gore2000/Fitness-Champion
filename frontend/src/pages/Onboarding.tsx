import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { userApi } from '@/api/userApi';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import type { ActivityLevel, DietaryPreference, Goal, WorkoutExperience } from '@/types';

const GOALS: { value: Goal; label: string; desc: string }[] = [
  { value: 'muscle_gain', label: 'Muscle Gain', desc: 'Build strength & size' },
  { value: 'fat_loss', label: 'Fat Loss', desc: 'Lean out sustainably' },
  { value: 'maintenance', label: 'Maintenance', desc: 'Stay consistent' },
];

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'Sedentary (little/no exercise)' },
  { value: 'light', label: 'Light (1-3 days/week)' },
  { value: 'moderate', label: 'Moderate (3-5 days/week)' },
  { value: 'active', label: 'Active (6-7 days/week)' },
  { value: 'very_active', label: 'Very Active (athlete / physical job)' },
];

const DIETARY: { value: DietaryPreference; label: string }[] = [
  { value: 'none', label: 'No preference' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'keto', label: 'Keto' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
];

const EXPERIENCE: { value: WorkoutExperience; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  const [form, setForm] = useState({
    age: 28,
    gender: 'male' as 'male' | 'female' | 'other',
    heightCm: 175,
    weightKg: 75,
    targetWeightKg: 72,
    goal: 'muscle_gain' as Goal,
    activityLevel: 'moderate' as ActivityLevel,
    dietaryPreference: 'none' as DietaryPreference,
    workoutExperience: 'beginner' as WorkoutExperience,
  });

  const steps = ['Basics', 'Goal', 'Activity', 'Preferences'];
  const update = (patch: Partial<typeof form>) => setForm({ ...form, ...patch });

  const handleFinish = async () => {
    setLoading(true);
    try {
      const { data } = await userApi.updateProfile({ name: user?.name, ...form });
      setUser(data.user);
      toast.success('Profile complete! Your targets are ready.');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 justify-center mb-6">
          <Sparkles className="text-brand-600" size={20} />
          <span className="font-display font-bold text-slate-700 dark:text-slate-200">Let's personalize your plan</span>
        </div>

        <div className="flex items-center gap-2 mb-8 px-2">
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full ${i <= step ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
              <p className={`text-[11px] mt-1 text-center ${i === step ? 'text-brand-600 font-semibold' : 'text-slate-400'}`}>{s}</p>
            </div>
          ))}
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 sm:p-8">
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Age</label>
                  <input type="number" className="input-field" value={form.age} onChange={(e) => update({ age: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="label-text">Gender</label>
                  <select className="input-field" value={form.gender} onChange={(e) => update({ gender: e.target.value as any })}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Height (cm)</label>
                  <input type="number" className="input-field" value={form.heightCm} onChange={(e) => update({ heightCm: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="label-text">Weight (kg)</label>
                  <input type="number" className="input-field" value={form.weightKg} onChange={(e) => update({ weightKg: Number(e.target.value) })} />
                </div>
                <div className="col-span-2">
                  <label className="label-text">Target weight (kg)</label>
                  <input type="number" className="input-field" value={form.targetWeightKg} onChange={(e) => update({ targetWeightKg: Number(e.target.value) })} />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => update({ goal: g.value })}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition ${
                    form.goal === g.value ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{g.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{g.desc}</p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <label className="label-text">Activity level</label>
              {ACTIVITY_LEVELS.map((a) => (
                <button
                  key={a.value}
                  onClick={() => update({ activityLevel: a.value })}
                  className={`w-full text-left p-3.5 rounded-2xl border-2 transition text-sm ${
                    form.activityLevel === a.value ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 font-semibold' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {a.label}
                </button>
              ))}

              <label className="label-text mt-4">Workout experience</label>
              <div className="grid grid-cols-3 gap-2">
                {EXPERIENCE.map((ex) => (
                  <button
                    key={ex.value}
                    onClick={() => update({ workoutExperience: ex.value })}
                    className={`p-3 rounded-2xl border-2 text-xs font-semibold transition ${
                      form.workoutExperience === ex.value ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <label className="label-text">Dietary preference</label>
              <div className="grid grid-cols-2 gap-2">
                {DIETARY.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => update({ dietaryPreference: d.value })}
                    className={`p-3 rounded-2xl border-2 text-sm transition ${
                      form.dietaryPreference === d.value ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 font-semibold' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8">
            <Button
              variant="secondary"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              type="button"
            >
              <ChevronLeft size={16} /> Back
            </Button>

            {step < steps.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)} type="button">
                Next <ChevronRight size={16} />
              </Button>
            ) : (
              <Button onClick={handleFinish} loading={loading} type="button">
                Build my plan <Sparkles size={16} />
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
