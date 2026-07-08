import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend,
} from 'chart.js';
import { BarChart3 } from 'lucide-react';
import { analyticsApi } from '@/api/analyticsApi';
import GlassCard from '@/components/ui/GlassCard';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function Analytics() {
  const [range, setRange] = useState<'weekly' | 'monthly'>('weekly');
  const { data } = useQuery({ queryKey: ['analytics', range], queryFn: () => analyticsApi.get(range) });
  const logs = data?.data.dailyLogs || [];
  const macros = data?.data.macroDistribution || { protein: 0, carbs: 0, fat: 0 };

  const labels = logs.map((l: any) => new Date(l.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));

  const proteinData = {
    labels,
    datasets: [{ label: 'Protein (g)', data: logs.map((l: any) => l.protein), backgroundColor: '#10B981', borderRadius: 8 }],
  };
  const caloriesData = {
    labels,
    datasets: [{ label: 'Calories', data: logs.map((l: any) => l.caloriesConsumed), backgroundColor: '#4F46E5', borderRadius: 8 }],
  };
  const waterData = {
    labels,
    datasets: [{ label: 'Water (ml)', data: logs.map((l: any) => l.waterMl), backgroundColor: '#818CF8', borderRadius: 8 }],
  };
  const sleepData = {
    labels,
    datasets: [{ label: 'Sleep (hrs)', data: logs.map((l: any) => l.sleepHours), backgroundColor: '#F59E0B', borderRadius: 8 }],
  };
  const macroDoughnut = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [{ data: [macros.protein, macros.carbs, macros.fat], backgroundColor: ['#10B981', '#4F46E5', '#F43F5E'] }],
  };

  const barOpts = { responsive: true, plugins: { legend: { display: false } } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <BarChart3 size={20} /> Analytics
        </h2>
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
          {(['weekly', 'monthly'] as const).map((r) => (
            <button key={r} onClick={() => setRange(r)} className={`px-3 py-1.5 rounded-lg font-medium capitalize ${range === r ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard><h3 className="font-display font-bold mb-3 text-slate-800 dark:text-slate-100">Weekly Protein</h3><Bar data={proteinData} options={barOpts} /></GlassCard>
        <GlassCard><h3 className="font-display font-bold mb-3 text-slate-800 dark:text-slate-100">Weekly Calories</h3><Bar data={caloriesData} options={barOpts} /></GlassCard>
        <GlassCard><h3 className="font-display font-bold mb-3 text-slate-800 dark:text-slate-100">Water Intake</h3><Bar data={waterData} options={barOpts} /></GlassCard>
        <GlassCard><h3 className="font-display font-bold mb-3 text-slate-800 dark:text-slate-100">Sleep Trends</h3><Bar data={sleepData} options={barOpts} /></GlassCard>
      </div>

      <GlassCard className="max-w-md">
        <h3 className="font-display font-bold mb-3 text-slate-800 dark:text-slate-100">Macro Distribution</h3>
        <Doughnut data={macroDoughnut} options={{ plugins: { legend: { position: 'bottom' } } }} />
      </GlassCard>
    </div>
  );
}
