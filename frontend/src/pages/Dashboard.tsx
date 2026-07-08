import { useQuery } from '@tanstack/react-query';
import { Flame, Droplets, Footprints, Moon, Dumbbell, TrendingUp } from 'lucide-react';
import { nutritionApi } from '@/api/nutritionApi';
import { missionApi } from '@/api/missionApi';
import { useAuthStore } from '@/store/authStore';
import GlassCard from '@/components/ui/GlassCard';
import ProgressRing from '@/components/ui/ProgressRing';
import StatCard from '@/components/ui/StatCard';
import PageLoader from '@/components/ui/PageLoader';
import { formatNumber } from '@/utils/calculations';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);

  const { data: logData, isLoading } = useQuery({
    queryKey: ['daily-log'],
    queryFn: () => nutritionApi.getDailyLog(),
  });

  const { data: missionData } = useQuery({
    queryKey: ['missions-today'],
    queryFn: () => missionApi.today(),
  });

  if (isLoading) return <PageLoader />;

  const log = logData?.data.dailyLog;
  const targets = logData?.data.targets;
  const missions = missionData?.data.missions || [];
  const completedCount = missions.filter((m) => m.completed).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100">
          Hey {user?.name?.split(' ')[0]}, here's today 👋
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Goal: <span className="capitalize font-medium text-brand-600 dark:text-brand-400">{user?.goal?.replace('_', ' ')}</span> &middot; {completedCount}/{missions.length} missions done
        </p>
      </div>

      <GlassCard className="grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-center">
        <ProgressRing value={log?.caloriesConsumed || 0} target={targets?.calories || 1} color="#4F46E5" label="Calories" unit="kcal" />
        <ProgressRing value={log?.protein || 0} target={targets?.protein || 1} color="#10B981" label="Protein" unit="g" />
        <ProgressRing value={log?.carbs || 0} target={targets?.carbs || 1} color="#F59E0B" label="Carbs" unit="g" />
        <ProgressRing value={log?.fat || 0} target={targets?.fat || 1} color="#F43F5E" label="Fat" unit="g" />
      </GlassCard>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Droplets size={20} />} label="Water" value={`${((log?.waterMl || 0) / 1000).toFixed(1)}L`} sublabel={`Goal ${(targets?.water || 3000) / 1000}L`} accent="brand" />
        <StatCard icon={<Footprints size={20} />} label="Steps" value={formatNumber(log?.steps)} sublabel={`Goal ${formatNumber(targets?.steps)}`} accent="success" />
        <StatCard icon={<Moon size={20} />} label="Sleep" value={`${log?.sleepHours || 0}h`} sublabel={`Goal ${targets?.sleep || 8}h`} accent="warning" />
        <StatCard icon={<Dumbbell size={20} />} label="Workout" value={log?.workoutCompleted ? 'Done' : 'Pending'} accent={log?.workoutCompleted ? 'success' : 'danger'} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-slate-800 dark:text-slate-100">Today's Missions</h3>
            <TrendingUp size={18} className="text-brand-500" />
          </div>
          <div className="space-y-3">
            {missions.slice(0, 4).map((m) => (
              <div key={m._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${m.completed ? 'bg-success-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                  <span className={`text-sm ${m.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{m.label}</span>
                </div>
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">+{m.xpReward} XP</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={0.1}>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="text-warning-500" size={20} />
            <h3 className="font-display font-bold text-slate-800 dark:text-slate-100">Streak</h3>
          </div>
          <p className="text-3xl font-display font-extrabold text-slate-800 dark:text-slate-100">{user?.streakDays || 0} days</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Level {user?.level} &middot; {user?.xp} XP</p>
        </GlassCard>
      </div>
    </div>
  );
}
