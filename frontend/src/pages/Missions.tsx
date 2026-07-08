import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Trophy, Flame, Star, Award } from 'lucide-react';
import { missionApi } from '@/api/missionApi';
import GlassCard from '@/components/ui/GlassCard';
import { useAuthStore } from '@/store/authStore';

export default function Missions() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const { data: missionData } = useQuery({ queryKey: ['missions-today'], queryFn: () => missionApi.today() });
  const { data: badgeData } = useQuery({ queryKey: ['badges'], queryFn: () => missionApi.badges() });

  const missions = missionData?.data.missions || [];
  const badges = badgeData?.data.badges || [];
  const xp = missionData?.data.xp ?? user?.xp ?? 0;
  const level = missionData?.data.level ?? user?.level ?? 1;
  const streak = missionData?.data.streakDays ?? user?.streakDays ?? 0;
  const xpForNext = level * 200;

  const progressMutation = useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) => missionApi.updateProgress(id, progress),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['missions-today'] });
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      if (res.data.newBadges?.length) {
        res.data.newBadges.forEach((b: any) => toast.success(`🏅 Badge earned: ${b.name}`));
      } else {
        toast.success('Progress updated');
      }
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <GlassCard className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 flex items-center justify-center"><Star size={20} /></div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Level</p>
            <p className="text-xl font-display font-bold text-slate-800 dark:text-slate-100">{level}</p>
            <p className="text-[11px] text-slate-400">{xp}/{xpForNext} XP</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-warning-50 dark:bg-warning-500/10 text-warning-600 dark:text-warning-400 flex items-center justify-center"><Flame size={20} /></div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Streak</p>
            <p className="text-xl font-display font-bold text-slate-800 dark:text-slate-100">{streak} days</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400 flex items-center justify-center"><Award size={20} /></div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Badges</p>
            <p className="text-xl font-display font-bold text-slate-800 dark:text-slate-100">{badges.length}</p>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2"><Trophy size={18} className="text-warning-500" /> Today's Missions</h3>
        <div className="space-y-3">
          {missions.map((m) => {
            const pct = Math.min(100, Math.round((m.progress / m.target) * 100));
            return (
              <div key={m._id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-sm font-medium ${m.completed ? 'text-success-600 dark:text-success-400' : 'text-slate-700 dark:text-slate-200'}`}>{m.label}</span>
                  <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold">+{m.xpReward} XP</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${m.completed ? 'bg-success-500' : 'bg-brand-500'}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between items-center mt-1.5">
                  <span className="text-[11px] text-slate-400">{m.progress}/{m.target} {m.unit}</span>
                  {!m.completed && (
                    <button
                      onClick={() => progressMutation.mutate({ id: m._id, progress: m.target })}
                      className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      Mark complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 mb-4">Badges</h3>
        {badges.length === 0 ? (
          <p className="text-sm text-slate-400">No badges yet — keep your streak going to earn your first one.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {badges.map((b) => (
              <div key={b._id} className="p-3 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-brand-900/30 dark:to-brand-900/10 text-center">
                <Award className="mx-auto text-brand-600 dark:text-brand-300 mb-1" size={22} />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{b.name}</p>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
