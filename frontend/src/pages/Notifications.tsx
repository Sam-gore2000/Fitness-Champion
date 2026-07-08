import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Droplets, Dumbbell, TrendingDown, TrendingUp, Flame, FileText } from 'lucide-react';
import { notificationApi } from '@/api/notificationApi';
import GlassCard from '@/components/ui/GlassCard';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';

const ICONS: Record<string, any> = {
  protein_low: TrendingDown,
  calories_low: TrendingDown,
  calories_high: TrendingUp,
  water_reminder: Droplets,
  workout_reminder: Dumbbell,
  weekly_report_ready: FileText,
  monthly_report_ready: FileText,
  streak_at_risk: Flame,
  badge_earned: CheckCheck,
  system: Bell,
};

export default function Notifications() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['notifications'], queryFn: () => notificationApi.list() });
  const notifications = data?.data.notifications || [];
  const unreadCount = data?.data.unreadCount || 0;

  const markReadMutation = useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100">
          Notifications {unreadCount > 0 && <span className="text-sm text-brand-600 dark:text-brand-400">({unreadCount} new)</span>}
        </h2>
        {unreadCount > 0 && (
          <Button variant="secondary" onClick={() => markAllMutation.mutate()}><CheckCheck size={16} /> Mark all read</Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <GlassCard>
          <EmptyState icon={<Bell size={22} />} title="You're all caught up" description="We'll let you know about protein, calorie, streak, and report alerts here." />
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = ICONS[n.type] || Bell;
            return (
              <GlassCard
                key={n._id}
                className={`flex items-start gap-3 cursor-pointer ${!n.read ? 'border-l-4 border-l-brand-500' : ''}`}
              >
                <div className="h-9 w-9 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0" onClick={() => !n.read && markReadMutation.mutate(n._id)}>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{n.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
