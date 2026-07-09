import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Trash2, Trophy, Dumbbell, X } from 'lucide-react';
import { workoutApi } from '@/api/workoutApi';
import GlassCard from '@/components/ui/GlassCard';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import type { ExerciseEntry, MuscleGroup } from '@/types';

// Muscle-group presets so the user can pick a common exercise instead of typing
// every name from scratch — tap a group, tap an exercise, adjust sets/reps/weight.
const MUSCLE_GROUPS: { value: MuscleGroup; label: string; emoji: string }[] = [
  { value: 'chest', label: 'Chest', emoji: '🏋️' },
  { value: 'back', label: 'Back', emoji: '🔙' },
  { value: 'biceps', label: 'Biceps', emoji: '💪' },
  { value: 'triceps', label: 'Triceps', emoji: '🦾' },
  { value: 'legs', label: 'Legs', emoji: '🦵' },
  { value: 'shoulders', label: 'Shoulders', emoji: '🤸' },
  { value: 'core', label: 'Core', emoji: '🧘' },
  { value: 'cardio', label: 'Cardio', emoji: '🏃' },
  { value: 'full_body', label: 'Full Body', emoji: '⚡' },
];

const EXERCISE_LIBRARY: Record<MuscleGroup, string[]> = {
  chest: ['Bench Press', 'Incline Dumbbell Press', 'Push-ups', 'Chest Fly', 'Dips'],
  back: ['Deadlift', 'Pull-ups', 'Barbell Row', 'Lat Pulldown', 'Seated Cable Row'],
  biceps: ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Concentration Curl'],
  triceps: ['Tricep Pushdown', 'Skull Crushers', 'Overhead Tricep Extension', 'Close-Grip Bench Press'],
  legs: ['Squat', 'Leg Press', 'Lunges', 'Leg Curl', 'Leg Extension', 'Calf Raise'],
  shoulders: ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Face Pull', 'Shrugs'],
  core: ['Plank', 'Crunches', 'Russian Twist', 'Hanging Leg Raise'],
  cardio: ['Running', 'Cycling', 'Rowing', 'Jump Rope', 'Stair Climber', 'Swimming'],
  full_body: ['Burpees', 'Kettlebell Swing', 'Clean and Press', 'Battle Ropes'],
};

const WORKOUT_TYPE_PRESETS = ['Push Day', 'Pull Day', 'Leg Day', 'Upper Body', 'Full Body', 'Cardio Session'];

function newExercise(muscleGroup: MuscleGroup): ExerciseEntry {
  return muscleGroup === 'cardio'
    ? { name: '', muscleGroup, sets: [], durationMinutes: 20 }
    : { name: '', muscleGroup, sets: [{ reps: 8, weightKg: 20 }] };
}

export default function Workouts() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('Push Day');
  const [duration, setDuration] = useState(45);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([
    { name: 'Bench Press', muscleGroup: 'chest', sets: [{ reps: 8, weightKg: 60 }] },
  ]);
  const [pickerFor, setPickerFor] = useState<number | null>(null); // index of exercise currently choosing a muscle group/name

  const { data: workoutsData } = useQuery({ queryKey: ['workouts'], queryFn: () => workoutApi.list() });
  const { data: recordsData } = useQuery({ queryKey: ['records'], queryFn: () => workoutApi.records() });
  const workouts = workoutsData?.data.workouts || [];
  const records = recordsData?.data.records || [];

  const createMutation = useMutation({
    mutationFn: workoutApi.create,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['daily-log'] });
      if (res.data.newPRs?.length) toast.success(`🎉 New personal record set!`);
      else toast.success('Workout logged');
      setModalOpen(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Could not log workout'),
  });

  const deleteMutation = useMutation({
    mutationFn: workoutApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast.success('Workout deleted');
    },
  });

  const updateExercise = (idx: number, patch: Partial<ExerciseEntry>) => {
    setExercises((prev) => prev.map((ex, i) => (i === idx ? { ...ex, ...patch } : ex)));
  };

  const updateSet = (exIdx: number, setIdx: number, key: 'reps' | 'weightKg', value: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx ? { ...ex, sets: ex.sets.map((s, si) => (si === setIdx ? { ...s, [key]: value } : s)) } : ex
      )
    );
  };

  const removeExercise = (idx: number) => setExercises((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100">Workout Tracker</h2>
        <Button onClick={() => setModalOpen(true)}><Plus size={16} /> Log workout</Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {workouts.length === 0 ? (
            <GlassCard>
              <EmptyState icon={<Dumbbell size={22} />} title="No workouts yet" description="Log your first session to start tracking sets, reps, and PRs." />
            </GlassCard>
          ) : (
            workouts.map((w) => (
              <GlassCard key={w._id}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display font-bold text-slate-800 dark:text-slate-100">{w.name}</h3>
                    <p className="text-xs text-slate-400">{new Date(w.date).toLocaleDateString()} &middot; {w.durationMinutes || '—'} min</p>
                  </div>
                  <button onClick={() => deleteMutation.mutate(w._id)} className="p-2 text-slate-400 hover:text-danger-500 rounded-xl hover:bg-danger-50 dark:hover:bg-danger-500/10">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="space-y-2">
                  {w.exercises.map((ex, i) => {
                    const group = MUSCLE_GROUPS.find((g) => g.value === (ex.muscleGroup as MuscleGroup));
                    return (
                      <div key={i} className="text-sm flex items-start gap-2">
                        {group && <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300">{group.emoji} {group.label}</span>}
                        <div>
                          <span className="font-medium text-slate-700 dark:text-slate-200">{ex.name}</span>
                          <span className="text-slate-400 ml-2">
                            {ex.durationMinutes
                              ? `${ex.durationMinutes} min`
                              : ex.sets.map((s) => `${s.reps}×${s.weightKg}kg`).join(', ')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            ))
          )}
        </div>

        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={18} className="text-warning-500" />
            <h3 className="font-display font-bold text-slate-800 dark:text-slate-100">Personal Records</h3>
          </div>
          {records.length === 0 ? (
            <p className="text-sm text-slate-400">No PRs yet — log a workout to set your first one.</p>
          ) : (
            <div className="space-y-2">
              {records.slice(0, 8).map((r) => (
                <div key={r._id} className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">{r.exerciseName}</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">{r.weightKg}kg × {r.reps}</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log a workout">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const cleanExercises = exercises.filter((ex) => ex.name.trim());
            if (cleanExercises.length === 0) {
              toast.error('Add at least one exercise with a name');
              return;
            }
            createMutation.mutate({ name, durationMinutes: duration, exercises: cleanExercises });
          }}
          className="space-y-4"
        >
          <div>
            <label className="label-text">Workout type</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {WORKOUT_TYPE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setName(preset)}
                  className={`text-xs px-3 py-1.5 rounded-full border-2 font-medium transition ${
                    name === preset ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300' : 'border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Or type a custom name" />
          </div>

          <input type="number" className="input-field" value={duration} onChange={(e) => setDuration(Number(e.target.value))} placeholder="Total duration (min)" />

          <div className="space-y-3">
            <label className="label-text mb-0">Exercises</label>
            {exercises.map((ex, exIdx) => {
              const group = MUSCLE_GROUPS.find((g) => g.value === ex.muscleGroup);
              const isCardio = ex.muscleGroup === 'cardio';
              return (
                <div key={exIdx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setPickerFor(pickerFor === exIdx ? null : exIdx)}
                      className="text-xs px-2.5 py-1 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-medium"
                    >
                      {group ? `${group.emoji} ${group.label}` : 'Choose muscle group'}
                    </button>
                    <button type="button" onClick={() => removeExercise(exIdx)} className="p-1 text-slate-400 hover:text-danger-500">
                      <X size={14} />
                    </button>
                  </div>

                  {pickerFor === exIdx && (
                    <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      {MUSCLE_GROUPS.map((g) => (
                        <button
                          key={g.value}
                          type="button"
                          onClick={() => { updateExercise(exIdx, newExercise(g.value)); setPickerFor(null); }}
                          className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-brand-100 dark:hover:bg-brand-900/40 text-slate-600 dark:text-slate-300"
                        >
                          {g.emoji} {g.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {ex.muscleGroup && (
                    <div className="flex flex-wrap gap-1.5">
                      {EXERCISE_LIBRARY[ex.muscleGroup].map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => updateExercise(exIdx, { name: suggestion })}
                          className={`text-[11px] px-2 py-1 rounded-lg border transition ${
                            ex.name === suggestion
                              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                              : 'border-slate-200 dark:border-slate-700 text-slate-500'
                          }`}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  <input
                    className="input-field"
                    value={ex.name}
                    onChange={(e) => updateExercise(exIdx, { name: e.target.value })}
                    placeholder="Exercise name (pick above or type your own)"
                  />

                  {isCardio ? (
                    <input
                      type="number"
                      className="input-field"
                      value={ex.durationMinutes || ''}
                      onChange={(e) => updateExercise(exIdx, { durationMinutes: Number(e.target.value) })}
                      placeholder="Duration (minutes)"
                    />
                  ) : (
                    <>
                      {ex.sets.map((s, setIdx) => (
                        <div key={setIdx} className="grid grid-cols-2 gap-2">
                          <input type="number" className="input-field" value={s.reps} onChange={(e) => updateSet(exIdx, setIdx, 'reps', Number(e.target.value))} placeholder="Reps" />
                          <input type="number" className="input-field" value={s.weightKg} onChange={(e) => updateSet(exIdx, setIdx, 'weightKg', Number(e.target.value))} placeholder="Weight (kg)" />
                        </div>
                      ))}
                      <button
                        type="button"
                        className="text-xs text-brand-600 dark:text-brand-400 font-medium"
                        onClick={() => updateExercise(exIdx, { sets: [...ex.sets, { reps: 8, weightKg: 20 }] })}
                      >
                        + Add set
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="text-sm text-brand-600 dark:text-brand-400 font-semibold"
            onClick={() => { setExercises([...exercises, newExercise('chest')]); setPickerFor(exercises.length); }}
          >
            + Add exercise
          </button>

          <Button type="submit" loading={createMutation.isPending} className="w-full">Save workout</Button>
        </form>
      </Modal>
    </div>
  );
}
