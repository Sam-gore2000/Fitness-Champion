import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Sparkles } from 'lucide-react';
import { aiApi } from '@/api/aiApi';
import GlassCard from '@/components/ui/GlassCard';
import Spinner from '@/components/ui/Spinner';

export default function Reports() {
  const [tab, setTab] = useState<'weekly' | 'monthly'>('weekly');

  const { data: weekly, isLoading: weeklyLoading } = useQuery({
    queryKey: ['weekly-report'],
    queryFn: () => aiApi.weeklyReport(),
    enabled: tab === 'weekly',
  });

  const { data: monthly, isLoading: monthlyLoading } = useQuery({
    queryKey: ['monthly-report'],
    queryFn: () => aiApi.monthlyReport(),
    enabled: tab === 'monthly',
  });

  const loading = tab === 'weekly' ? weeklyLoading : monthlyLoading;
  const report = tab === 'weekly' ? weekly?.data.report : monthly?.data.report;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <FileText size={20} /> AI Progress Reports
        </h2>
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
          {(['weekly', 'monthly'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg font-medium capitalize ${tab === t ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-brand-600" />
          <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 capitalize">{tab} summary</h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><Spinner size={28} /></div>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {report || 'No data yet — keep logging to generate your first report.'}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
