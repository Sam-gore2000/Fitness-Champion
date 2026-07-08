import type { ReactNode } from 'react';

export default function EmptyState({ icon, title, description, action }: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="h-14 w-14 rounded-2xl bg-brand-50 dark:bg-brand-900/30 text-brand-500 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-4">{description}</p>
      {action}
    </div>
  );
}
