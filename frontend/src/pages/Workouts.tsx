import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Trash2, Trophy, Dumbbell } from 'lucide-react';
import { workoutApi } from '@/api/workoutApi';
import GlassCard from '@/components/ui/GlassCard';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import type { ExerciseEntry } from '@/types';

export default function Workouts() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('Push Day');
  const [duration, setDuration] = useState(45);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([
    { name: 'Bench Press', sets: [{ reps: 8, weightKg: 60 }] },
  ]);

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
                  {w.exercises.map((ex, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-200">{ex.name}</span>
                      <span className="text-slate-400 ml-2">
                        {ex.sets.map((s) => `${s.reps}×${s.weightKg}kg`).join(', ')}
                      </span>
                    </div>
                  ))}
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
            createMutation.mutate({ name, durationMinutes: duration, exercises });
          }}
          className="space-y-4"
        >
          <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Workout name" />
          <input type="number" className="input-field" value={duration} onChange={(e) => setDuration(Number(e.target.value))} placeholder="Duration (min)" />

          {exercises.map((ex, exIdx) => (
            <div key={exIdx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
              <input className="input-field" value={ex.name} onChange={(e) => updateExercise(exIdx, { name: e.target.value })} placeholder="Exercise name" />
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
            </div>
          ))}

          <button
            type="button"
            className="text-sm text-brand-600 dark:text-brand-400 font-semibold"
            onClick={() => setExercises([...exercises, { name: '', sets: [{ reps: 8, weightKg: 20 }] }])}
          >
            + Add exercise
          </button>

          <Button type="submit" loading={createMutation.isPending} className="w-full">Save workout</Button>
        </form>
      </Modal>
    </div>
  );
}
