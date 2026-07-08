import type { ReactNode } from 'react';

export default function StatCard({
  icon,
  label,
  value,
  sublabel,
  accent = 'brand',
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  accent?: 'brand' | 'success' | 'warning' | 'danger';
}) {
  const accentClasses: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300',
    success: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400',
    warning: 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400',
    danger: 'bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-400',
  };

  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${accentClasses[accent]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{label}</p>
        <p className="text-xl font-bold font-display text-slate-800 dark:text-slate-100 leading-tight">{value}</p>
        {sublabel && <p className="text-[11px] text-slate-400">{sublabel}</p>}
      </div>
    </div>
  );
}
