import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Plus, Ruler } from 'lucide-react';
import { bodyApi } from '@/api/bodyApi';
import GlassCard from '@/components/ui/GlassCard';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function BodyMeasurements() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [range, setRange] = useState<'weekly' | 'monthly'>('monthly');
  const [form, setForm] = useState({ weightKg: 0, chestCm: 0, waistCm: 0, armsCm: 0, legsCm: 0, neckCm: 0, bodyFatPct: 0 });

  const { data } = useQuery({ queryKey: ['body', range], queryFn: () => bodyApi.list(range) });
  const measurements = data?.data.measurements || [];

  const createMutation = useMutation({
    mutationFn: bodyApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['body'] });
      toast.success('Measurement logged');
      setModalOpen(false);
    },
  });

  const labels = measurements.map((m) => new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
  const weightSeries = measurements.map((m) => m.weightKg ?? null);
  const waistSeries = measurements.map((m) => m.waistCm ?? null);

  const chartData = {
    labels,
    datasets: [
      { label: 'Weight (kg)', data: weightSeries, borderColor: '#4F46E5', backgroundColor: '#4F46E5', tension: 0.35 },
      { label: 'Waist (cm)', data: waistSeries, borderColor: '#F59E0B', backgroundColor: '#F59E0B', tension: 0.35 },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100">Body Measurements</h2>
        <Button onClick={() => setModalOpen(true)}><Plus size={16} /> Log measurement</Button>
      </div>

      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Ruler size={18} /> Trends</h3>
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
            {(['weekly', 'monthly'] as const).map((r) => (
              <button key={r} onClick={() => setRange(r)} className={`px-3 py-1.5 rounded-lg font-medium capitalize ${range === r ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
        {measurements.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No measurements logged for this range yet.</p>
        ) : (
          <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
        )}
      </GlassCard>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {['chestCm', 'waistCm', 'armsCm', 'legsCm'].map((key) => {
          const latest = measurements[measurements.length - 1] as any;
          return (
            <GlassCard key={key}>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold">{key.replace('Cm', '')}</p>
              <p className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100 mt-1">{latest?.[key] ?? '—'} cm</p>
            </GlassCard>
          );
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log body measurement">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(form);
          }}
          className="grid grid-cols-2 gap-3"
        >
          {(['weightKg', 'chestCm', 'waistCm', 'armsCm', 'legsCm', 'neckCm', 'bodyFatPct'] as const).map((key) => (
            <input
              key={key}
              type="number"
              step="0.1"
              className="input-field"
              placeholder={key}
              value={(form as any)[key] || ''}
              onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
            />
          ))}
          <Button type="submit" loading={createMutation.isPending} className="col-span-2">Save</Button>
        </form>
      </Modal>
    </div>
  );
}
